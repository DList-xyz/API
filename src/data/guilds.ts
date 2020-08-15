import { GuildDocument, SavedGuild } from './models/guild';
import DBWrapper from './db-wrapper';
import { getWeek } from '../utils/command-utils';

export default class Guilds extends DBWrapper<string, GuildDocument> {
    protected async getOrCreate(id: string) {
        if (!id || id === 'user') return null;

        const savedGuild = await SavedGuild.findById(id)
            ?? await this.create(id);

        const votedForThisWeek = savedGuild.lastVoteAt
            && getWeek(savedGuild.lastVoteAt) === getWeek(new Date());
        if (!votedForThisWeek)
            savedGuild.votes = [];
            
        return savedGuild;
    }

    protected create(id: string) {        
        return new SavedGuild({ _id: id }).save();
    }

    async delete(id: string) {
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