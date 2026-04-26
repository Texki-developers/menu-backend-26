import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { CookieUtils } from '../../../common/utils';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Dashboard Auth')
@Controller('auth/dashboard')
@UseGuards(ThrottlerGuard)
export class DashboardAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unified Admin/Staff login (sets HttpOnly cookies)' })
  @ApiResponse({ status: 200, description: 'Login successful, tokens set in cookies' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.dashboardLogin(loginDto);
    CookieUtils.setAuthCookies(response, result);
    return { 
      message: 'Login successful',
      user: result.user 
    };
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access/refresh tokens using the refresh_token cookie' })
  @ApiResponse({ status: 200, description: 'New tokens set in cookies' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token;
    const tokens = await this.authService.refreshTokens(refreshToken);
    CookieUtils.setAuthCookies(response, tokens);
    return { message: 'Token refreshed' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dashboard logout (clears cookies)' })
  @ApiResponse({ status: 200, description: 'Logout successful, cookies cleared' })
  async logout(@Res({ passthrough: true }) response: Response) {
    CookieUtils.clearAuthCookies(response);
    return { message: 'Logged out successfully' };
  }
}
