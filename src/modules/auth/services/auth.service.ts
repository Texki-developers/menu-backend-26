import { Injectable, UnauthorizedException } from '@nestjs/common';
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
import { USER_ROLES } from '../../../constants/user-roles.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(Staff.name) private readonly staffModel: Model<Staff>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
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

  async adminLogin(loginDto: LoginDto) {
    const admin = await this.adminModel.findOne({ email: loginDto.email }).select('+password');
    if (!admin || !(await PasswordUtils.compare(loginDto.password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: admin._id.toString(),
      email: admin.email,
      role: admin.branch_ids.length > 0 ? USER_ROLES.BRANCH_ADMIN : USER_ROLES.ORG_ADMIN,
      organization_id: admin.organization_id.toString(),
      branch_ids: admin.branch_ids.map(id => id.toString()),
    };

    return this.generateTokens(payload);
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
      organization_id: staff.organization_id.toString(),
      branch_id: staff.branch_id.toString(),
    };

    return this.generateTokens(payload);
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
      organization_id: customer.organization_id.toString(),
      branch_id: customer.branch_id.toString(),
    };

    return this.generateTokens(payload);
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
      organization_id: customer.organization_id.toString(),
      branch_id: customer.branch_id.toString(),
    };

    return this.generateTokens(payload);
  }
}
