type ApiKey = {
  id: string;
  key: string;
  label: string | null;
  revoked: boolean;
  createdAt: Date;
};

declare module "elysia" {
  interface Context {
    apiKey?: ApiKey;
    apiKeyError?: { error: string };
  }
}

export {};
