import { model, Schema } from 'mongoose';

export interface IFriendship {
  requester: Schema.Types.ObjectId;
  recipient: Schema.Types.ObjectId;
  status: 'ACCEPTED' | 'PENDING' | 'REJECTED';
}

const friendshipSchema = new Schema<IFriendship>({
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
