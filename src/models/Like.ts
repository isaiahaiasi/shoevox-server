import { model, Schema } from 'mongoose';

interface ILike {
  user: Schema.Types.ObjectId;
  room: Schema.Types.ObjectId;
}

const likeSchema = new Schema<ILike>({
  user: {
    type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true,
  },
  room: {
    type: Schema.Types.ObjectId, ref: 'Room', required: true, immutable: true,
  },
}, {
  timestamps: {
    createdAt: true,
  },
  collection: 'likes',
});

export default model('Like', likeSchema);
