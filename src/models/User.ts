import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String, required: true, minLength: 3, maxLength: 15,
  },
  password: { type: String, required: true, minLength: 8 },
}, {
  timestamps: true,
});

export default model('User', userSchema);
