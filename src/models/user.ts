import { IUser } from '@/types/global.types';
import mongoose, { Document, Schema } from 'mongoose';

const codeforcesUserSchema: Schema<IUser> = new Schema({
    ip: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
    org: { type: String, required: true },
    postal: { type: String, required: true },
    timezone: { type: String, required: true },
});

const CodeforcesUser = mongoose.models.CodeforcesUser || mongoose.model<IUser>('CodeforcesUser', codeforcesUserSchema);

export default CodeforcesUser;