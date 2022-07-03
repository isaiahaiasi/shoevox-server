export const providers = ['google'] as const;
export type Provider = typeof providers[number];

export interface OauthUserData {
  displayName: string;
  email: string;
  oauthId: string;
}
