import { Router } from 'express';
import Guilds from '../../../data/guilds';
import Users from '../../../data/users';
import Deps from '../../../utils/deps';
import { sendError } from '../../modules/api-utils';
import { getUser } from '../user-routes';

export const router = Router({ mergeParams: true });

const guilds = Deps.get<Guilds>(Guilds),
      users = Deps.get<Users>(Users);

router.post('/review', async (req, res) => {
  try {
    const reviewer = await getUser(req.query.key);
    const savedReviewer = await users.get(reviewer);
    if (savedReviewer.role !== 'admin' &&
      savedReviewer.role !== 'reviewer')
      throw new TypeError('Insufficient permissions.');
    
    const exists = await guilds.exists(req.params.id);
    if (!exists)
      throw new TypeError('Bot does not exist.');

    res.json({ success: true });
  } catch (error) { sendError(res, 400, error); }
});

router.get('/add-badge/:name', async (req, res) => {
  try {
    const reviewer = await getUser(req.query.key);
    const savedReviewer = await users.get(reviewer);
    if (savedReviewer.role !== 'admin')
      throw new TypeError('Insufficient permissions.');
    
    const exists = await guilds.exists(req.params.id);
    if (!exists)
      throw new TypeError('Server does not exist.');
    
    const savedGuild = await guilds.get(req.params.id);
    savedGuild.badges.push(req.params.name);
    await savedGuild.save();
    
    res.json({ success: true });
  } catch (error) { sendError(res, 400, error); }
});