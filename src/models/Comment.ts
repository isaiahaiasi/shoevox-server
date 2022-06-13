import { model, Schema } from 'mongoose';

const commentSchema = new Schema({
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
