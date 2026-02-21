import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { CookieUtils } from '../../../common/utils';

@ApiTags('Staff Auth')
@Controller('auth/staff')
export class StaffAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff login (sets HttpOnly cookies)' })
  @ApiResponse({ status: 200, description: 'Login successful, tokens set in cookies' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.staffLogin(loginDto);
    CookieUtils.setAuthCookies(response, tokens);
    return { message: 'Login successful' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff logout (clears cookies)' })
  @ApiResponse({ status: 200, description: 'Logout successful, cookies cleared' })
  async logout(@Res({ passthrough: true }) response: Response) {
    CookieUtils.clearAuthCookies(response);
    return { message: 'Logged out successfully' };
  }
}
