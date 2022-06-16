import { model, Schema } from 'mongoose';

export interface IUser {
  username: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String, required: true, minLength: 3, maxLength: 15,
  },
  password: { type: String, required: true, minLength: 8 },
}, {
  timestamps: true,
  collection: 'users',
});

export default model('User', userSchema);
