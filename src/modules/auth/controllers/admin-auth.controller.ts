import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { AdminRegisterDto } from '../dto/admin-register.dto';
import { CookieUtils } from '../../../common/utils';

@ApiTags('Admin Auth')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login (sets HttpOnly cookies)' })
  @ApiResponse({ status: 200, description: 'Login successful, tokens set in cookies' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.adminLogin(loginDto);
    CookieUtils.setAuthCookies(response, tokens);
    return { message: 'Login successful' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin logout (clears cookies)' })
  @ApiResponse({ status: 200, description: 'Logout successful, cookies cleared' })
  async logout(@Res({ passthrough: true }) response: Response) {
    CookieUtils.clearAuthCookies(response);
    return { message: 'Logged out successfully' };
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin register (sets HttpOnly cookies)' })
  @ApiResponse({ status: 201, description: 'Registration successful, tokens set in cookies' })
  async register(
    @Body() registerDto: AdminRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.adminRegister(registerDto);
    CookieUtils.setAuthCookies(response, tokens);
    return { message: 'Registration successful' };
  }
}
