import { Router } from 'express';
import Deps from '../../../utils/deps';
import Guilds from '../../../data/guilds';
import BotLogs from '../../../data/guild-logs';
import { validateGuildManager } from '../../modules/api-utils';
import { sendError, validateCanEdit, saveBotAndChanges } from '../../modules/api-utils';
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

    let savedGuild = await saveBotAndChanges(req, id);

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