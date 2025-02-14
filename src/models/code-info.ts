import { ICodeInfo } from '@/types/global.types';
import mongoose, { Schema } from 'mongoose';

const codeInfoSchema: Schema<ICodeInfo> = new Schema({
    status: { type: String },
    problemName: { type: String },
    problemUrl: { type: String, required: true },
    code: { type: String, required: true },
    codeLanguage: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'CodeforcesUser' },
});

const CodeInfo = mongoose.models.CodeInfo || mongoose.model<ICodeInfo>('CodeInfo', codeInfoSchema);

export default CodeInfo;