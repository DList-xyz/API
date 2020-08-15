import { Router } from 'express';
import { bot } from '../../../bot';
import Servers from '../../../data/servers';
import { SavedServer } from '../../../data/models/server';
import { UserDocument } from '../../../data/models/user';
import Users from '../../../data/users';
import Deps from '../../../utils/deps';
import { sendError } from '../../modules/api-utils';
import { ServerWidgetGenerator as ServerWidgetGenerator } from '../../modules/image/server-widget-generator';
import Stats from '../../modules/stats';
import { AuthClient } from '../../server';
import { getUser } from '../user-routes';

export const router = Router();

const servers = Deps.get<Servers>(Servers),
      stats = Deps.get<Stats>(Stats),
      users = Deps.get<Users>(Users);

router.get('/', async (req, res) => {
    try {
        const guilds = [];
        const savedServers = await SavedServer.find();

        for (const savedServer of savedServers) {
            const guild = bot.guilds.cache.get(savedServer.id);
            if (!guild) continue;

            guilds.push({
                ...guild,
                iconURL: guild.iconURL({ dynamic: true, size: 256 })
            });
        }
        res.json({ saved: savedServers, guilds });
    } catch (error) { sendError(res, 400, error); }
});

router.get('/user', async (req, res) => {
    try {
        const bots = await getManagableBots(req.query.key);
        res.json(bots);
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id', (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        res.json({
            ...guild,
            iconURL: guild.iconURL({ dynamic: true, size: 256 })
        });
    } catch (error) { sendError(res, 400, error); }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await validateServerManager(req.query.key, id);

        await servers.delete(id);

        res.json({ success: true });
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/vote', async (req, res) => {
    try {
        const id = req.params.id;
        
        const voter = await getUser(req.query.key);
        const savedVoter = await users.get(voter);

        validateIfCanVote(savedVoter);

        savedVoter.lastVotedAt = new Date();
        await savedVoter.save();

        const savedServer = await servers.get(id);
        savedServer.votes.push({ at: new Date(), by: voter.id });
        savedServer.totalVotes++;
        savedServer.lastVoteAt = new Date();
        await savedServer.save();

        res.json({ success: true });        
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/saved', async (req, res) => {
    try {
        const savedServer = await servers.get(req.params.id);
        res.json(savedServer);
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/widget', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        const savedServer = await servers.get(req.params.id);
        const image = await new ServerWidgetGenerator(guild, savedServer)
            .generate(req.query.size?.toString() ?? 'large');
        
        res.set({ 'Content-Type': 'image/png' }).send(image);
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/stats', (req, res) => {
    const id = req.params.id;

    res.json({
        general: stats.general(id),
        topVoters: stats.votes(id),
        votes: stats.votes(id),
        recentVotes: stats.recentVotes(id)
    });
});

function validateIfCanVote(savedVoter: UserDocument) {
    const twelveHoursMs = 1000 * 60 * 60 * 12;
    const oneDayAgo = new Date(Date.now() - twelveHoursMs);
    if (savedVoter.lastVotedAt > oneDayAgo) {
        const timeLeftMs = new Date(savedVoter.lastVotedAt.getTime() + twelveHoursMs).getTime() - Date.now();
        const hoursLeft = (timeLeftMs / 1000 / 60 / 60);
        throw new TypeError(`You have already voted. You can next vote in ${hoursLeft.toFixed(2)} hours.`);
    }
}

async function getManagableBots(key: any) {
    const { id } = await AuthClient.getUser(key);
    const owner = bot.users.cache.get(id);

    const savedServers = await servers.getManageable(owner);
    const ids = savedServers.map(b => b._id);

    return bot.users.cache.filter(u => ids.includes(u.id));
}

export async function validateServerManager(key: any, botId: string) {
    if (!key)
        throw new TypeError('Unauthorized.');

    const bots = await getManagableBots(key);
    if (!bots.some(b => b.id === botId))
        throw TypeError('Bot not manageable.');
}

export interface BotStats {
    guildCount: number;
}