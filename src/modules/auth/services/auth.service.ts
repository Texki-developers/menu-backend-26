import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../../users/schemas/admin.schema';
import { Staff } from '../../users/schemas/staff.schema';
import { Customer } from '../../users/schemas/customer.schema';
import { PasswordUtils } from '../../../common/utils/password.utils';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AdminRegisterDto } from '../dto/admin-register.dto';
import { USER_ROLES } from '../../../constants/user-roles.constant';
import { LOGIN_METHODS } from '../../../constants/login-methods.constant';
import { OtpService } from './otp.service';
import { RequestEmailOtpDto } from '../dto/request-email-otp.dto';
import { VerifyEmailOtpDto } from '../dto/verify-email-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(Staff.name) private readonly staffModel: Model<Staff>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    private readonly otpService: OtpService,
  ) {}

  async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async dashboardLogin(loginDto: LoginDto) {
    // Try Admin login first (Admin precedence)
    try {
      return await this.adminLogin(loginDto);
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        throw error;
      }
      // If Admin fails, try Staff login
      try {
        return await this.staffLogin(loginDto);
      } catch (staffError) {
        // Return generic error to avoid user enumeration
        throw new UnauthorizedException('Invalid credentials');
      }
    }
  }

  async adminLogin(loginDto: LoginDto) {
    const admin = await this.adminModel.findOne({ email: loginDto.email }).select('+password');
    if (!admin || !(await PasswordUtils.compare(loginDto.password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: admin._id.toString(),
      email: admin.email,
      role: admin.branch_ids.length > 0 ? USER_ROLES.BRANCH_ADMIN : USER_ROLES.ORG_ADMIN,
      organizationId: admin.organization_id.toString(),
      branchIds: admin.branch_ids.map(id => id.toString()),
    };

    const tokens = await this.generateTokens(payload);
    return {
      ...tokens,
      user: {
        id: admin._id,
        email: admin.email,
        fullName: admin.full_name,
        role: payload.role,
        organizationId: payload.organizationId,
        branchIds: payload.branchIds,
      }
    };
  }

  async adminRegister(registerDto: AdminRegisterDto) {
    const existingAdmin = await this.adminModel.findOne({ email: registerDto.email });
    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }
    const hashedPassword = await PasswordUtils.hash(registerDto.password);
    const admin = new this.adminModel({
      ...registerDto,
      password: hashedPassword,
    });
    await admin.save();

    const payload: JwtPayload = {
      sub: admin._id.toString(),
      email: admin.email,
      role: admin.branch_ids && admin.branch_ids.length > 0 ? USER_ROLES.BRANCH_ADMIN : USER_ROLES.ORG_ADMIN,
      organizationId: admin.organization_id.toString(),
      branchIds: admin.branch_ids ? admin.branch_ids.map(id => id.toString()) : [],
    };

    const tokens = await this.generateTokens(payload);
    return {
      ...tokens,
      user: {
        id: admin._id,
        email: admin.email,
        fullName: admin.full_name,
        role: payload.role,
        organizationId: payload.organizationId,
        branchIds: payload.branchIds,
      }
    };
  }

  async staffLogin(loginDto: LoginDto) {
    const staff = await this.staffModel.findOne({ email: loginDto.email }).select('+password');
    if (!staff || !(await PasswordUtils.compare(loginDto.password, staff.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: staff._id.toString(),
      email: staff.email,
      role: USER_ROLES.STAFF,
      organizationId: staff.organization_id.toString(),
      branchId: staff.branch_id.toString(),
    };

    const tokens = await this.generateTokens(payload);
    return {
      ...tokens,
      user: {
        id: staff._id,
        email: staff.email,
        fullName: staff.full_name,
        role: payload.role,
        organizationId: payload.organizationId,
        branchId: payload.branchId,
      }
    };
  }

  async customerLogin(loginDto: LoginDto) {
    const customer = await this.customerModel.findOne({ email: loginDto.email }).select('+password');
    if (!customer || !customer.password || !(await PasswordUtils.compare(loginDto.password, customer.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: customer._id.toString(),
      email: customer.email,
      role: USER_ROLES.CUSTOMER,
      organizationId: customer.organization_id.toString(),
      branchId: customer.branch_id.toString(),
    };

    const tokens = await this.generateTokens(payload);
    return {
      ...tokens,
      user: {
        id: customer._id,
        email: customer.email,
        fullName: customer.full_name,
        role: payload.role,
        organizationId: payload.organizationId,
        branchId: payload.branchId,
      }
    };
  }

  async customerRequestEmailOtp(dto: RequestEmailOtpDto) {
    await this.otpService.requestEmailOtp(dto.email, dto.branch_id);
    return { message: 'Verification code sent' };
  }

  async customerVerifyEmailOtp(dto: VerifyEmailOtpDto) {
    const verified = await this.otpService.verifyEmailOtp(
      dto.email,
      dto.code,
      dto.branch_id,
    );

    let customer = await this.customerModel.findOne({ email: verified.email });
    let isNew = false;

    if (!customer) {
      isNew = true;
      customer = new this.customerModel({
        email: verified.email,
        full_name: dto.full_name?.trim() || verified.email.split('@')[0],
        organization_id: verified.organization_id,
        branch_id: verified.branch_id,
        is_verified: true,
        login_method: LOGIN_METHODS.EMAIL_OTP,
      });
      await customer.save();
    } else if (!customer.is_verified) {
      customer.is_verified = true;
      if (dto.full_name?.trim()) customer.full_name = dto.full_name.trim();
      await customer.save();
    }

    const payload: JwtPayload = {
      sub: customer._id.toString(),
      email: customer.email,
      role: USER_ROLES.CUSTOMER,
      organizationId: customer.organization_id.toString(),
      branchId: customer.branch_id.toString(),
    };

    const tokens = await this.generateTokens(payload);
    return {
      ...tokens,
      is_new_user: isNew,
      user: {
        id: customer._id,
        email: customer.email,
        fullName: customer.full_name,
        role: payload.role,
        organizationId: payload.organizationId,
        branchId: payload.branchId,
      },
    };
  }

  async customerRegister(registerDto: RegisterDto) {
    const hashedPassword = await PasswordUtils.hash(registerDto.password);
    const customer = new this.customerModel({
      ...registerDto,
      password: hashedPassword,
    });
    await customer.save();

    const payload: JwtPayload = {
      sub: customer._id.toString(),
      email: customer.email,
      role: USER_ROLES.CUSTOMER,
      organizationId: customer.organization_id.toString(),
      branchId: customer.branch_id.toString(),
    };

    const tokens = await this.generateTokens(payload);
    return {
      ...tokens,
      user: {
        id: customer._id,
        email: customer.email,
        fullName: customer.full_name,
        role: payload.role,
        organizationId: payload.organizationId,
        branchId: payload.branchId,
      }
    };
  }
}
