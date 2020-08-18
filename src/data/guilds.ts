import { GuildDocument, SavedGuild } from './models/guild';
import DBWrapper from './db-wrapper';
import { getWeek } from '../utils/command-utils';
import { Guild } from 'discord.js';
import { emitter } from '../bot';

export default class Guilds extends DBWrapper<Guild, GuildDocument> {
    protected async getOrCreate(guild: Guild) {
        if (!guild.id || guild.id === 'user') return null;

        const savedGuild = await SavedGuild.findById(guild.id)
            ?? await this.create(guild);

        const votedForThisWeek = savedGuild.lastVoteAt
            && getWeek(savedGuild.lastVoteAt) === getWeek(new Date());
        if (!votedForThisWeek)
            savedGuild.votes = [];
            
        return savedGuild;
    }

    protected create(guild: Guild) {
        const savedGuild = new SavedGuild({
            _id: guild.id,
            ownerId: guild.ownerID
        });

        emitter.emit('savedGuildCreate', savedGuild);

        return savedGuild.save();
    }

    async delete({ id }: Guild) {
        return await SavedGuild.findByIdAndDelete(id);
    }

    exists(id: string) {
        return SavedGuild.exists({ _id: id });
    }

    async getManageable({ id }: { id: string }) {
        return await SavedGuild.find({ ownerId: id });
    }

    async getAll() {
        return await SavedGuild.find();
    }
}