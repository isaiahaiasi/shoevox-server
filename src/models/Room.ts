import { model, Schema } from 'mongoose';

export interface IRoom {
  creator: Schema.Types.ObjectId;
  title: string;
  url: string;
}

const roomSchema = new Schema<IRoom>({
  creator: {
    type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true,
  },
  title: {
    type: String, required: true, minLength: 3, maxLength: 100,
  },
}, {
  timestamps: true,
  collection: 'rooms',
});

roomSchema.virtual('url').get(function getUrl() {
  return `https://placeholder-host-d0cae2/roomdata/${this._id}`;
});

export default model('Room', roomSchema);
