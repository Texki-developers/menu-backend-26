import type { Response } from 'express';

export class CookieUtils {
  static setAuthCookies(
    response: Response,
    tokens: { access_token: string; refresh_token: string },
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSite = isProduction ? 'none' : 'lax';
    const secure = isProduction;

    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 60 * 60 * 1000, // 1 hour — matches JWT_EXPIRATION
    });

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days — matches REFRESH_TOKEN_EXPIRATION
    });
  }

  static clearAuthCookies(response: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const options = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    };
    response.clearCookie('access_token', options);
    response.clearCookie('refresh_token', options);
  }
}
