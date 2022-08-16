import { model, Schema } from 'mongoose';
import { Provider, providers } from '../utils/auth';

export interface IFederatedCredential {
  user: Schema.Types.ObjectId;
  provider: Provider;
  oauthId: string;
}

const commentSchema = new Schema<IFederatedCredential>({
  user: {
    type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true,
  },
  provider: {
    type: String, enum: providers, required: true, immutable: true,
  },
  oauthId: {
    type: String, required: true,
  },
}, {
  timestamps: true,
  collection: 'federated_credentials',
});

export default model('FederatedCredentials', commentSchema);
