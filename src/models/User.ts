import { model, Schema } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String, required: true, minLength: 3, maxLength: 15, unique: true,
  },
  email: { type: String, required: true }, // TODO: Validation?
}, {
  timestamps: true,
  collection: 'users',
});

export default model('User', userSchema);
