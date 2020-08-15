import { GuildDocument, SavedGuild } from './models/guild';
import DBWrapper from './db-wrapper';
import { getWeek } from '../utils/command-utils';
import { Guild } from 'discord.js';

export default class Guilds extends DBWrapper<Guild, GuildDocument> {
    protected async getOrCreate(guild: Guild) {
        if (!guild.id || guild.id === 'user') return null;

        const savedGuild = await SavedGuild.findById(guild.id)
            ?? await this.create(guild);

        const votedForThisWeek = savedGuild.lastVoteAt
            && getWeek(savedGuild.lastVoteAt) === getWeek(new Date());
        if (!votedForThisWeek)
            savedGuild.votes = [];
        
        if (!savedGuild.listing.id)
            savedGuild.listing.id = guild.id;
            
        return savedGuild;
    }

    protected create(guild: Guild) {        
        return new SavedGuild({
            _id: guild.id,
            ownerId: guild.ownerID
        }).save();
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