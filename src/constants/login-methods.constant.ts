export const LOGIN_METHODS = {
  PASSWORD: 'password',
  GOOGLE: 'google',
  APPLE: 'apple',
} as const;

export type LoginMethod = (typeof LOGIN_METHODS)[keyof typeof LOGIN_METHODS];
