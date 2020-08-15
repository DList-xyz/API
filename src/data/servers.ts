import { ServerDocument, SavedServer } from './models/server';
import DBWrapper from './db-wrapper';
import { getWeek } from '../utils/command-utils';

export default class Servers extends DBWrapper<string, ServerDocument> {
    protected async getOrCreate(id: string) {
        if (!id || id === 'user') return null;

        const savedServer = await SavedServer.findById(id)
            ?? await this.create(id);

        const votedForThisWeek = savedServer.lastVoteAt
            && getWeek(savedServer.lastVoteAt) === getWeek(new Date());
        if (!votedForThisWeek)
            savedServer.votes = [];
            
        return savedServer;
    }

    protected create(id: string) {        
        return new SavedServer({ _id: id }).save();
    }

    async delete(id: string) {
        return await SavedServer.findByIdAndDelete(id);
    }

    exists(id: string) {
        return SavedServer.exists({ _id: id });
    }

    async getManageable({ id }: { id: string }) {
        return await SavedServer.find({ ownerId: id });
    }

    async getAll() {
        return await SavedServer.find();
    }
}