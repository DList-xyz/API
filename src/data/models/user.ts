import { model, Schema, Document } from 'mongoose';

const userSchema = new Schema({
    _id: String,
    lastVotedAt: Date,
    role: String
});

export interface UserDocument extends Document {
    _id: string;
    lastVotedAt: Date;
    role: UserRole;
}

export type UserRole = '' | 'reviewer' | 'admin';

export const SavedUser = model<UserDocument>('user', userSchema);