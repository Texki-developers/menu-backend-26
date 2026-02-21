import type { Response } from 'express';

export class CookieUtils {
  static setAuthCookies(
    response: Response,
    tokens: { access_token: string; refresh_token: string },
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  static clearAuthCookies(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
  }
}
