import { Router } from 'express';
import Deps from '../../../utils/deps';
import BotLogs from '../../../data/server-logs';
import { sendError } from '../../modules/api-utils';
import { validateServerManager } from './servers-routes';

export const router = Router({ mergeParams: true });

const logs = Deps.get<BotLogs>(BotLogs);

router.get('/log', async(req, res) => {
  try {
    const id = req.params.id;
    await validateServerManager(req.query.key, id);

    const log = await logs.get(id);
    res.json(log);
  } catch (error) { sendError(res, 400, error); }
});