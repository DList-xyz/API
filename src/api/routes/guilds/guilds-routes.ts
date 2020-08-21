import { Router } from 'express';
import { bot } from '../../../bot';
import Guilds from '../../../data/guilds';
import { SavedGuild } from '../../../data/models/guild';
import Users from '../../../data/users';
import Deps from '../../../utils/deps';
import { sendError, toAPIGuild, getManagableGuilds, validateGuildManager, getUser, validateIfCanVote } from '../../modules/api-utils';
import { ServerWidgetGenerator } from '../../modules/image/guild-widget-generator';
import Stats from '../../modules/stats';
import config from '../../../../config.json';
import { TextChannel, MessageEmbed } from 'discord.js';

export const router = Router();

const guilds = Deps.get<Guilds>(Guilds),
      stats = Deps.get<Stats>(Stats),
      users = Deps.get<Users>(Users);

router.get('/', async (req, res) => {
    try {
        const guilds = [];
        const savedGuilds = await SavedGuild.find();

        for (const savedGuild of savedGuilds) {
            const guild = bot.guilds.cache.get(savedGuild.id);
            if (!guild) continue;

            guilds.push(toAPIGuild(guild));
        }
        res.json({ saved: savedGuilds, guilds });
    } catch (error) { sendError(res, 400, error); }
});

router.get('/user', async (req, res) => {
    try {
        const bots = await getManagableGuilds(req.query.key?.toString());
        res.json(bots);
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id', (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        res.json(toAPIGuild(guild));
    } catch (error) { sendError(res, 400, error); }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await validateGuildManager(req.query.key, id);

        const guild = bot.guilds.cache.get(id);
        await guilds.delete(guild);

        res.json({ success: true });
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/vote', async (req, res) => {
    try {        
        const voter = await getUser(req.query.key);
        const savedVoter = await users.get(voter);

        validateIfCanVote(savedVoter);

        savedVoter.lastVotedAt = new Date();
        await savedVoter.save();

        const guild = bot.guilds.cache.get(req.params.id);
        const savedGuild = await guilds.get(guild);
        savedGuild.votes.push({ at: new Date(), by: voter.id });
        savedGuild.totalVotes++;
        savedGuild.lastVoteAt = new Date();
        await savedGuild.save();

        res.json({ success: true });        
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/saved', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        const savedGuild = await guilds.get(guild);
        res.json(savedGuild);
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/widget', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        const savedGuild = await guilds.get(guild);
        const image = await new ServerWidgetGenerator(guild, savedGuild)
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

router.get('/:id/report', async (req, res) => {
    try {
        const authUser = await getUser(req.query.key);
        const user = bot.users.cache.get(authUser.id);

        const targetGuild = bot.guilds.cache.get(req.params.id);
        if (!targetGuild)
            throw new TypeError('Gulld not found.');

        await (bot.guilds.cache
            .get(config.guild.id)?.channels.cache
            .get(config.guild.reportChannelId) as TextChannel)
            ?.send(new MessageEmbed({
                title: `Report for \`${targetGuild.name}\``,
                fields: [
                    { name: 'Server ID', value: `\`${targetGuild.id}\`` },
                    { name: 'Reason', value: req.query.reason }
                ],
                thumbnail: { url: targetGuild.iconURL({ dynamic: true, size: 64 }) },
                footer: {
                    text: `Reported by ${user.tag} - ${user.id}`,
                    iconURL: user.avatarURL({ dynamic: true, size: 32 }) 
                }
            }));

        res.json({ success: true });
    } catch (error) { sendError(res, 400, error); }
});