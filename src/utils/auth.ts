export const providers = ['google', 'github'] as const;
export type Provider = typeof providers[number];

export interface OauthCredentialData {
  displayName: string;
  oauthId: string;
  provider: Provider;
  email?: string;
}
