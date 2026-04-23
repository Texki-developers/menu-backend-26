import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { MailerService } from './services/mailer.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DashboardAuthController } from './controllers/dashboard-auth.controller';
import { CustomerAuthController } from './controllers/customer-auth.controller';
import { EmailOtp, EmailOtpSchema } from './schemas/email-otp.schema';
import { Branch, BranchSchema } from '../branches/schema/branches.schema';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: EmailOtp.name, schema: EmailOtpSchema },
      { name: Branch.name, schema: BranchSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      }),
    }),
  ],
  controllers: [DashboardAuthController, CustomerAuthController],
  providers: [AuthService, OtpService, MailerService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
