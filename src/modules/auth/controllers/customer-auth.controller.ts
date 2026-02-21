import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { CookieUtils } from '../../../common/utils';

@ApiTags('Customer Auth')
@Controller('auth/customer')
export class CustomerAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Customer registration (sets HttpOnly cookies)' })
  @ApiResponse({ status: 201, description: 'Customer registered successfully, tokens set in cookies' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.customerRegister(registerDto);
    CookieUtils.setAuthCookies(response, tokens);
    return { message: 'Registration successful' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login (sets HttpOnly cookies)' })
  @ApiResponse({ status: 200, description: 'Login successful, tokens set in cookies' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.customerLogin(loginDto);
    CookieUtils.setAuthCookies(response, tokens);
    return { message: 'Login successful' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer logout (clears cookies)' })
  @ApiResponse({ status: 200, description: 'Logout successful, cookies cleared' })
  async logout(@Res({ passthrough: true }) response: Response) {
    CookieUtils.clearAuthCookies(response);
    return { message: 'Logged out successfully' };
  }
}
