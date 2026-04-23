export const LOGIN_METHODS = {
  PASSWORD: 'password',
  EMAIL_OTP: 'email_otp',
  PHONE_OTP: 'phone_otp',
  GOOGLE: 'google',
  APPLE: 'apple',
} as const;

export type LoginMethod = (typeof LOGIN_METHODS)[keyof typeof LOGIN_METHODS];
