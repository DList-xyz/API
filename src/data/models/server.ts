import { model, Schema, Document } from 'mongoose';

export interface Flag {
    at: Date;    
    reason: string;
}

export class Listing {
    id: string;
    body: string;
    language: string;
    overview: string;
    tags: string[];
}

export interface Vote {
    at: Date;
    by: string;
}

const serverSchema = new Schema({
    _id: String,
    badges: { type: Array, default: [] },
    invite: String,
    flags: { type: Array, default: [] },
    listing: Object,
    ownerId: String,
    totalVotes: { type: Number, default: 0 },
    lastVoteAt: Date,
    votes: { type: Array, default: [] }
});

export interface ServerDocument extends Document {
    _id: string;
    badges: string[];
    invite: string;
    flags: Flag[];
    listing: Listing;
    ownerId: string;
    totalVotes: number;
    lastVoteAt: Date;
    votes: Vote[];
}

export const SavedServer = model<ServerDocument>('server', serverSchema);