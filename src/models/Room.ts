import { model, Schema } from 'mongoose';

// TODO: URL Validation?
const roomSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true,
  },
  title: {
    type: String, required: true, minLength: 3, maxLength: 100,
  },
  url: { type: String, required: true },
}, {
  timestamps: true,
});

export default model('Room', roomSchema);
