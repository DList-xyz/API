import { Router } from 'express';
import Deps from '../../../utils/deps';
import Servers from '../../../data/servers';
import BotLogs from '../../../data/server-logs';
import { getUser, AuthUser } from '../user-routes';
import { Listing } from '../../../data/models/server';
import AuditLogger from '../../modules/audit-logger';
import { validateServerManager } from './servers-routes';
import { sendError } from '../../modules/api-utils';

export const router = Router();

const servers = Deps.get<Servers>(Servers),
      logs = Deps.get<BotLogs>(BotLogs);

router.post('/', async (req, res) => {
  try {
    const authUser = await getUser(req.query.key);

    const listing: Listing = req.body;
    const id = listing.id;
    await validateCanCreate(req, id);

    const savedServer = await servers.get(id);
    savedServer.listing = listing;
    savedServer.ownerId = authUser.id;
    await savedServer.save();

    res.status(200).json(savedServer);
  } catch (error) { sendError(res, 400, error); }
});

router.put('/:id([0-9]{18})', async (req, res) => {
  try {
    const { id } = req.params;
    const key = req.query.key;

    await validateServerManager(key, id);

    const listing: Listing = req.body;
    await validateCanEdit(req, id);

    let savedServer = await saveBotAndChanges(id, req);

    res.json(savedServer);
  } catch (error) { sendError(res, 400, error); }
});

router.delete('/:id([0-9]{18})', async (req, res) => {
  try {
    const { id } = req.params;
    const key = req.query.key;

    await validateServerManager(key, id);

    await servers.delete(req.params.id);

    res.json({ success: true });
  } catch (error) { sendError(res, 400, error); }
});

async function validateCanCreate(req, id: string) {
  if (!req.body)
    throw new TypeError('Request body is empty.');

  const exists = await servers.exists(id);
  if (exists)
    throw new TypeError('Bot already exists!');
}
async function validateCanEdit(req, id: string) {
  if (!req.body)
    throw new TypeError('Request body is empty.');

  const exists = await servers.exists(id);
  if (!exists)
    throw new TypeError('Bot does not exist.');
}

async function saveBotAndChanges(id: any, req: any) {
  let savedServer = await servers.get(id);

  const change = AuditLogger.getChanges(
    { old: savedServer.listing, new: req.body }, savedServer.ownerId);
  
  savedServer.listing = req.body;

  const log = await logs.get(id);
  log.changes.push(change);
  await log.save();
  
  return servers.save(savedServer);
}
