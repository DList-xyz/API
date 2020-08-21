import { Guild } from 'discord.js';
import { AuthClient } from '../server';
import { UserDocument } from '../../data/models/user';
import { bot } from '../../bot';
import Deps from '../../utils/deps';
import Guilds from '../../data/guilds';
import Users from '../../data/users';
import BotLogs from '../../data/guild-logs';
import AuditLogger from './audit-logger';

const guilds = Deps.get<Guilds>(Guilds),
      logs = Deps.get<BotLogs>(BotLogs),
      users = Deps.get<Users>(Users);

export function sendError(res: any, code: number, error: Error) {
  return res.status(code).json({ code, message: error?.message });
}

export function toAPIGuild(guild: Guild) {
  return {
    id: guild.id,
    name: guild.name,
    ownerID: guild.ownerID,
    memberCount: guild.memberCount,
    iconURL: guild.iconURL({ dynamic: true, size: 256 }),
    managerIds: guild.members.cache
      .filter(m => m.permissions.has('MANAGE_GUILD'))
      .map(m => m.id)
  }
}

export function validateIfCanVote(savedVoter: UserDocument) {
  const twelveHoursMs = 1000 * 60 * 60 * 12;
  const oneDayAgo = new Date(Date.now() - twelveHoursMs);

  if (savedVoter.lastVotedAt > oneDayAgo) {
    const timeLeftMs = new Date(savedVoter.lastVotedAt.getTime() + twelveHoursMs).getTime() - Date.now();
    const hoursLeft = (timeLeftMs / 1000 / 60 / 60);
    throw new TypeError(`You have already voted. You can next vote in ${hoursLeft.toFixed(2)} hours.`);
  }
}

export async function getManagableGuilds(key: string) {
  const authGuilds: Map<string, AuthGuild> = await AuthClient.getGuilds(key);

  const ids = Array.from(authGuilds.values())
    .filter(g => g.permissions.includes('MANAGE_GUILD'))
    .map(g => g.id);

  return bot.guilds.cache
    .filter(u => ids.includes(u.id));
}

export async function validateGuildManager(key: any, botId: string) {
  if (!key)
    throw new TypeError('Unauthorized.');

  const authUser: AuthUser = await AuthClient.getUser(key);
  const savedUser = await users.get(authUser); 
  if (savedUser.role === 'admin') return;

  const guilds = await getManagableGuilds(key);
  if (!guilds.some(b => b.id === botId))
    throw TypeError('Server not manageable.');
}

export async function getUser(key: any) {
  let authUser: AuthUser = await AuthClient.getUser(key);

  authUser['displayAvatarURL'] = authUser.avatarUrl(64);
  authUser = JSON
    .parse(JSON.stringify(authUser)
      .replace(/"_(.*?)"/g, '"$1"'));

  return authUser;
}

export async function validateCanEdit(req, id: string) {
  if (!req.body)
    throw new TypeError('Request body is empty.');

  const exists = await guilds.exists(id);
  if (!exists)
    throw new TypeError('Bot does not exist.');
}

export async function saveBotAndChanges(req: any, id: string) {
  const guild = bot.guilds.cache.get(id); 
  let savedGuild = await guilds.get(guild);

  const change = AuditLogger.getChanges(
    { old: savedGuild.listing, new: req.body }, savedGuild.ownerId);
  
  savedGuild.listing = req.body;

  const log = await logs.get(id);
  log.changes.push(change);
  await log.save();
  
  return guilds.save(savedGuild);
}

export interface AuthGuild {
  id: string;
  name: string;
  iconHash: string;
  features: string[];
  isOwner: boolean;
  permissions: string[];
  createdTimestamp: number;
  createdAt: string;

  iconUrl: (size: number) => string;
}

export interface AuthUser {
  username: string;
  locale: string;
  isMFAEnabled: boolean;
  discriminator: number;
  id: string;
  avatarHash: string;
  userFlags: string[];
  premiumType: string;
  bot: boolean;
  createdTimestamp: number;
  createdAt: string;

  avatarUrl: (size: number) => string;
}
