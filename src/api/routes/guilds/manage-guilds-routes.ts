import { Router } from 'express';
import Deps from '../../../utils/deps';
import Guilds from '../../../data/guilds';
import BotLogs from '../../../data/guild-logs';
import { getUser } from '../user-routes';
import { Listing } from '../../../data/models/guild';
import AuditLogger from '../../modules/audit-logger';
import { validateGuildManager } from './guilds-routes';
import { sendError } from '../../modules/api-utils';
import { bot } from '../../../bot';

export const router = Router();

const guilds = Deps.get<Guilds>(Guilds),
      logs = Deps.get<BotLogs>(BotLogs);

router.put('/:id([0-9]{18})', async (req, res) => {
  try {
    const { id } = req.params;
    const key = req.query.key;

    await validateGuildManager(key, id);
    await validateCanEdit(req, id);

    let savedGuild = await saveBotAndChanges(id, req);

    res.json(savedGuild);
  } catch (error) { sendError(res, 400, error); console.log(error);
   }
});

router.delete('/:id([0-9]{18})', async (req, res) => {
  try {
    const { id } = req.params;
    const key = req.query.key;

    await validateGuildManager(key, id);

    const guild = bot.guilds.cache.get(req.params.id);
    await guilds.delete(guild);

    res.json({ success: true });
  } catch (error) { sendError(res, 400, error); }
});

async function validateCanEdit(req, id: string) {
  if (!req.body)
    throw new TypeError('Request body is empty.');

  const exists = await guilds.exists(id);
  if (!exists)
    throw new TypeError('Bot does not exist.');
}

async function saveBotAndChanges(id: any, req: any) {
  let savedGuild = await guilds.get(id);

  const change = AuditLogger.getChanges(
    { old: savedGuild.listing, new: req.body }, savedGuild.ownerId);
  
  savedGuild.listing = req.body;

  const log = await logs.get(id);
  log.changes.push(change);
  await log.save();
  
  return guilds.save(savedGuild);
}
