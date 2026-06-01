import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
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
  @ApiOperation({ summary: 'Unified Admin/Staff login (returns Bearer tokens)' })
  @ApiResponse({ status: 200, description: 'Login successful, tokens returned in response body' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.dashboardLogin(loginDto);
    return {
      message: 'Login successful',
      user: result.user,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    };
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access/refresh tokens using refresh_token from body' })
  @ApiResponse({ status: 200, description: 'New tokens returned in response body' })
  async refresh(@Body() body: { refresh_token: string }) {
    const tokens = await this.authService.refreshTokens(body?.refresh_token);
    return {
      message: 'Token refreshed',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dashboard logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout() {
    return { message: 'Logged out' };
  }
}
