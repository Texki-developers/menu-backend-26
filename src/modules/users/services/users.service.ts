import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Admin } from '../schemas/admin.schema';
import { Staff } from '../schemas/staff.schema';
import { Customer } from '../schemas/customer.schema';
import { Organization } from '../../organizations/schemas/organization.schema';
import { CreateAdminDto, CreateOrgAdminDto, CreateBranchAdminDto } from '../dto/create-admin.dto';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { GetAllStaffDto } from '../dto/get-all-staff.dto';
import { PasswordUtils } from '../../../common/utils/password.utils';
import { paginate } from '../../../common/utils/pagination.utils';
import { handleDbError } from '../../../common/utils/db-error.utils';
import { SortOrder } from '../../../common/interfaces/pagination.interface';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { GetAllCustomersDto } from '../dto/get-all-customers.dto';
import { USER_ROLES, UserRole } from '../../../constants/user-roles.constant';
import { escapeRegex } from '../../../common/utils/regex.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(Staff.name) private readonly staffModel: Model<Staff>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Organization.name) private readonly organizationModel: Model<Organization>,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto, role: UserRole): Promise<Admin> {
    // Validate organization exists
    if (createAdminDto.organization_id) {
       const orgExists = await this.organizationModel.findById(createAdminDto.organization_id);
       if (!orgExists) {
         throw new NotFoundException('Organization not found');
       }
    }

    const existing = await this.adminModel.findOne({ email: createAdminDto.email });
    if (existing) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashedPassword = await PasswordUtils.hash(createAdminDto.password);
    const adminData: any = {
      ...createAdminDto,
      password: hashedPassword,
      role,
    };

    const admin = new this.adminModel(adminData);
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
      organization_id: createStaffDto.organization_id ? new Types.ObjectId(createStaffDto.organization_id) : undefined,
      branch_id: createStaffDto.branch_id ? new Types.ObjectId(createStaffDto.branch_id) : undefined,
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
  async getAllStaff(queryDto: GetAllStaffDto) {
    console.log("🚀 ~ UsersService ~ getAllStaff ~ queryDto:", queryDto)
    try {
      const baseFilter: Record<string, any> = {};
      if (queryDto.organization_id) {
        const orgId = queryDto.organization_id;
        baseFilter.organization_id = { $in: [new Types.ObjectId(orgId), orgId] };
      }
      if (queryDto.branch_id) {
        const branchId = queryDto.branch_id;
        baseFilter.branch_id = { $in: [new Types.ObjectId(branchId), branchId] };
      }
      const searchFilter: Record<string, any> = {};
      if (queryDto.role) searchFilter.role = queryDto.role;
      if (queryDto.is_active !== undefined) searchFilter.is_active = queryDto.is_active;
      
      if (queryDto.query) {
        const safeQuery = escapeRegex(queryDto.query);
        searchFilter.$or = [
          { full_name: { $regex: safeQuery, $options: 'i' } },
          { email: { $regex: safeQuery, $options: 'i' } },
          { phone: { $regex: safeQuery, $options: 'i' } },
          { employee_code: { $regex: safeQuery, $options: 'i' } },
        ];
      }
      
      console.log("🚀 ~ UsersService ~ getAllStaff ~ baseFilter:", baseFilter)
      console.log("🚀 ~ UsersService ~ getAllStaff ~ searchFilter:", searchFilter)
      return await paginate(this.staffModel, {
        page: queryDto.page,
        limit: queryDto.limit,
        sortBy: queryDto.sortBy || 'created_at',
        sortOrder: (queryDto.sortOrder?.toUpperCase() as SortOrder) || SortOrder.DESC,
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

  async changeStaffPassword(id: string, newPassword: string): Promise<{ message: string }> {
    try {
      const hashedPassword = await PasswordUtils.hash(newPassword);
      const result = await this.staffModel.findByIdAndUpdate(
        id,
        { $set: { password: hashedPassword } },
        { new: true }
      ).exec();
      if (!result) throw new NotFoundException(`Staff with ID ${id} not found`);
      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, `changing password for staff ${id}`);
      throw error;
    }
  }


  async downloadStaffCsv(res: any, orgId: string) {
    try {
      const filter: Record<string, any> = {};
      if (orgId) {
        filter.organization_id = { $in: [new Types.ObjectId(orgId), orgId] };
      }
      const staffList = await this.staffModel.find(filter).lean();

      const headers = ['Full Name', 'Email', 'Phone', 'Role', 'Employee Code', 'Is Active', 'Created At'];
      const rows = staffList.map((s: any) => [
        s.full_name || '',
        s.email || '',
        s.phone || '',
        s.role || '',
        s.employee_code || '',
        s.is_active ? 'Active' : 'Inactive',
        s.created_at ? new Date(s.created_at).toLocaleString() : '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=staff.csv');
      return res.status(200).send(csvContent);
    } catch (error) {
      handleDbError(error, 'downloading staff csv');
      throw error;
    }
  }

  async getAllCustomers(queryDto: GetAllCustomersDto) {
    try {
      const baseFilter: Record<string, any> = {};
      if (queryDto.organization_id) {
        baseFilter.organization_id = { $in: [new Types.ObjectId(queryDto.organization_id), queryDto.organization_id] };
      }
      if (queryDto.branch_id) {
        baseFilter.branch_id = { $in: [new Types.ObjectId(queryDto.branch_id), queryDto.branch_id] };
      }
      const searchFilter: Record<string, any> = {};
      if (queryDto.is_verified !== undefined) searchFilter.is_verified = queryDto.is_verified;
      if (queryDto.query) {
        const safeQuery = escapeRegex(queryDto.query);
        searchFilter.$or = [
          { full_name: { $regex: safeQuery, $options: 'i' } },
          { email: { $regex: safeQuery, $options: 'i' } },
          { phone: { $regex: safeQuery, $options: 'i' } },
        ];
      }
      return await paginate(this.customerModel, {
        page: queryDto.page,
        limit: queryDto.limit,
        sortBy: queryDto.sortBy || 'created_at',
        sortOrder: (queryDto.sortOrder?.toUpperCase() as SortOrder) || SortOrder.DESC,
        baseFilter,
        searchFilter,
      });
    } catch (error) {
      handleDbError(error, 'getting all customers');
      throw error;
    }
  }

  async getCustomerById(id: string): Promise<Customer> {
    try {
      const customer = await this.customerModel.findById(id).exec();
      if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);
      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, `getting customer with ID ${id}`);
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
