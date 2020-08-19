import { Guild } from 'discord.js';

export function sendError(res: any, code: number, error: Error) {
  return res.status(code).json({ code, message: error?.message });
}

export function toAPIGuild(guild: Guild) {
  return {
    id: guild.id,
    name: guild.name,
    ownerID: guild.ownerID,
    memberCount: guild.memberCount,
    iconURL: guild.iconURL({ dynamic: true, size: 256 })
  }
}