import { model, Schema, Document } from 'mongoose';

export interface Flag {
    at: Date;    
    reason: string;
}

export class Listing {
    id = '';
    body = 'A server that has not yet been edited.';
    language: string;
    overview = 'No description set.';
    tags = [];
}

export interface Vote {
    at: Date;
    by: string;
}

const guildSchema = new Schema({
    _id: String,
    badges: { type: Array, default: [] },
    invite: String,
    flags: { type: Array, default: [] },
    listing: { type: Object, default: new Listing() },
    ownerId: String,
    totalVotes: { type: Number, default: 0 },
    lastBumpAt: Date,
    lastVoteAt: Date,
    votes: { type: Array, default: [] }
});

export interface GuildDocument extends Document {
    _id: string;
    badges: string[];
    invite: string;
    flags: Flag[];
    listing: Listing;
    ownerId: string;
    totalVotes: number;
    lastBumpAt: Date;
    lastVoteAt: Date;
    votes: Vote[];
}

export const SavedGuild = model<GuildDocument>('guild', guildSchema);