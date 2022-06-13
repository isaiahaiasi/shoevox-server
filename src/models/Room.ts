import { model, Schema } from 'mongoose';

interface IRoom {
  creator: Schema.Types.ObjectId;
  title: string;
  url: string;
}

// TODO: URL Validation?
const roomSchema = new Schema<IRoom>({
  creator: {
    type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true,
  },
  title: {
    type: String, required: true, minLength: 3, maxLength: 100,
  },
  url: { type: String, required: true },
}, {
  timestamps: true,
  collection: 'rooms',
});

export default model('Room', roomSchema);
