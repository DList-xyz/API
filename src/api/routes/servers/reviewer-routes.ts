import { Router } from 'express';
import Servers from '../../../data/servers';
import Users from '../../../data/users';
import Deps from '../../../utils/deps';
import { sendError } from '../../modules/api-utils';
import { getUser } from '../user-routes';

export const router = Router({ mergeParams: true });

const servers = Deps.get<Servers>(Servers),
      users = Deps.get<Users>(Users);

router.post('/review', async (req, res) => {
  try {
    const reviewer = await getUser(req.query.key);
    const savedReviewer = await users.get(reviewer);
    if (savedReviewer.role !== 'admin' &&
      savedReviewer.role !== 'reviewer')
      throw new TypeError('Insufficient permissions.');
    
    const exists = await servers.exists(req.params.id);
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
    
    const exists = await servers.exists(req.params.id);
    if (!exists)
      throw new TypeError('Server does not exist.');
    
    const savedServer = await servers.get(req.params.id);
    savedServer.badges.push(req.params.name);
    await savedServer.save();
    
    res.json({ success: true });
  } catch (error) { sendError(res, 400, error); }
});