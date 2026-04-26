import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RequestEmailOtpDto } from '../dto/request-email-otp.dto';
import { VerifyEmailOtpDto } from '../dto/verify-email-otp.dto';
import { CookieUtils } from '../../../common/utils';

@ApiTags('Customer Auth')
@Controller('auth/customer')
export class CustomerAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
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

  @Public()
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

  @Public()
  @Post('email/request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a 6-digit code to the provided email' })
  @ApiResponse({ status: 200, description: 'Code dispatched (always returns success when accepted)' })
  async requestEmailOtp(@Body() dto: RequestEmailOtpDto) {
    return this.authService.customerRequestEmailOtp(dto);
  }

  @Public()
  @Post('email/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify the emailed code and log the customer in (creates account if new)' })
  @ApiResponse({ status: 200, description: 'Verified, session cookies set' })
  async verifyEmailOtp(
    @Body() dto: VerifyEmailOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.customerVerifyEmailOtp(dto);
    CookieUtils.setAuthCookies(response, {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
    return {
      message: 'Login successful',
      is_new_user: result.is_new_user,
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
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
  @ApiOperation({ summary: 'Customer logout (clears cookies)' })
  @ApiResponse({ status: 200, description: 'Logout successful, cookies cleared' })
  async logout(@Res({ passthrough: true }) response: Response) {
    CookieUtils.clearAuthCookies(response);
    return { message: 'Logged out successfully' };
  }
}
