import { Router } from 'express';
import Deps from '../../../utils/deps';
import BotLogs from '../../../data/guild-logs';
import { sendError } from '../../modules/api-utils';
import { validateGuildManager } from './guilds-routes';

export const router = Router({ mergeParams: true });

const logs = Deps.get<BotLogs>(BotLogs);

router.get('/log', async(req, res) => {
  try {
    const id = req.params.id;
    await validateGuildManager(req.query.key, id);

    const log = await logs.get(id);
    res.json(log);
  } catch (error) { sendError(res, 400, error); }
});