import { model, Schema } from 'mongoose';

const likeSchema = new Schema({
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
});

export default model('Like', likeSchema);
