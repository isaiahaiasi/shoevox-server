import { model, Schema } from 'mongoose';

export interface IComment {
  user: Schema.Types.ObjectId;
  room: Schema.Types.ObjectId;
  content: string;
}
const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true,
  },
  room: {
    type: Schema.Types.ObjectId, ref: 'Room', required: true, immutable: true,
  },
  content: {
    type: String, required: true, minLength: 3, maxLength: 140,
  },
}, {
  timestamps: true,
  collection: 'comments',
});

export default model('Comment', commentSchema);
