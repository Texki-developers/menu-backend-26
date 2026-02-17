import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../schemas/admin.schema';
import { Staff } from '../schemas/staff.schema';
import { Customer } from '../schemas/customer.schema';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { PasswordUtils } from '../../../common/utils/password.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(Staff.name) private readonly staffModel: Model<Staff>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const existing = await this.adminModel.findOne({ email: createAdminDto.email });
    if (existing) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashedPassword = await PasswordUtils.hash(createAdminDto.password);
    const admin = new this.adminModel({
      ...createAdminDto,
      password: hashedPassword,
    });
    return admin.save();
  }

  async createStaff(createStaffDto: CreateStaffDto): Promise<Staff> {
    const existing = await this.staffModel.findOne({ 
      $or: [{ email: createStaffDto.email }, { employee_code: createStaffDto.employee_code }] 
    });
    if (existing) {
      throw new ConflictException('Staff with this email or employee code already exists');
    }

    const hashedPassword = await PasswordUtils.hash(createStaffDto.password);
    const staff = new this.staffModel({
      ...createStaffDto,
      password: hashedPassword,
    });
    return staff.save();
  }

  async findAdminByEmail(email: string): Promise<Admin | null> {
    return this.adminModel.findOne({ email }).select('+password').exec();
  }

  async findStaffByEmail(email: string): Promise<Staff | null> {
    return this.staffModel.findOne({ email }).select('+password').exec();
  }

  async findCustomerByEmail(email: string): Promise<Customer | null> {
    return this.customerModel.findOne({ email }).select('+password').exec();
  }
}
