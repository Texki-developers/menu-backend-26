import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../schemas/admin.schema';
import { Staff } from '../schemas/staff.schema';
import { Customer } from '../schemas/customer.schema';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { GetAllStaffDto } from '../dto/get-all-staff.dto';
import { PasswordUtils } from '../../../common/utils/password.utils';
import { paginate } from '../../../common/utils/pagination.utils';
import { handleDbError } from '../../../common/utils/db-error.utils';
import { SortOrder } from '../../../common/interfaces/pagination.interface';
import { UpdateStaffDto } from '../dto/update-staff.dto';

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

  // Staff Management CRUD
  async getAllStaff(query: GetAllStaffDto) {
    try {
      const baseFilter: Record<string, any> = {};
      if (query.organization_id) baseFilter.organization_id = query.organization_id;
      if (query.branch_id) baseFilter.branch_id = query.branch_id;

      const searchFilter: Record<string, any> = {};
      if (query.role) searchFilter.role = query.role;
      if (query.is_active !== undefined) searchFilter.is_active = query.is_active;

      return await paginate(this.staffModel, {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: (query.sortOrder?.toUpperCase() as SortOrder) || SortOrder.DESC,
        baseFilter,
        searchFilter,
      });
    } catch (error) {
      handleDbError(error, 'getting all staff');
      throw error;
    }
  }

  async getStaffById(id: string): Promise<Staff> {
    try {
      const staff = await this.staffModel.findById(id).exec();
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${id} not found`);
      }
      return staff;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, `getting staff with ID ${id}`);
      throw error;
    }
  }

  async updateStaff(id: string, updateData: UpdateStaffDto): Promise<Staff> {
    try {
      if (updateData.password) {
        updateData.password = await PasswordUtils.hash(updateData.password);
      }

      const updatedStaff = await this.staffModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).exec();

      if (!updatedStaff) {
        throw new NotFoundException(`Staff with ID ${id} not found`);
      }
      return updatedStaff;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, `updating staff with ID ${id}`);
      throw error;
    }
  }

  async deleteStaff(id: string): Promise<any> {
    try {
      const result = await this.staffModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Staff with ID ${id} not found`);
      }
      return { success: true, message: 'Staff deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, `deleting staff with ID ${id}`);
      throw error;
    }
  }
}
