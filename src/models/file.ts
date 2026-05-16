import mongoose, { models, Schema } from 'mongoose';

export interface IFile {
  url: string;
  name: string;
  type: string;
}

const fileSchema = new Schema<IFile>(
  {
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

fileSchema.index({ createdAt: 1 }, { expireAfterSeconds: 172800 });

const File = models.File || mongoose.model('File', fileSchema);
export default File;
