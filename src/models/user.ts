import { IUser } from '@/types/global.types';
import mongoose, { Schema } from 'mongoose';

const codeforcesUserSchema: Schema<IUser> = new Schema({
    userId: { type: String, required: true },
    ip: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
    org: { type: String, required: true },
    postal: { type: String, required: true },
    timezone: { type: String, required: true },
    browser: { type: String, required: true },
    theme: { type: String, required: true },
    ui: { type: String, required: true },
});

const CodeforcesUser = mongoose.models.CodeforcesUser || mongoose.model<IUser>('CodeforcesUser', codeforcesUserSchema);

export default CodeforcesUser;