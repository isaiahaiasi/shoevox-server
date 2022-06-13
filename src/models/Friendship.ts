import { model, Schema } from 'mongoose';

const friendshipSchema = new Schema({
  requester: {
    type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true,
  },
  recipient: {
    type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true,
  },
  status: {
    type: String,
    enum: ['ACCEPTED', 'PENDING', 'REJECTED'],
    default: 'PENDING',
  },
}, {
  timestamps: {
    createdAt: true,
  },
  collection: 'friendships',
});

export default model('Friendship', friendshipSchema);
