import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from '../../organizations/schemas/organization.schema';
import { Admin } from '../../users/schemas/admin.schema';
import { SystemSetupDto } from '../dto/system-setup.dto';
import { PasswordUtils } from '../../../common/utils/password.utils';

@Injectable()
export class SystemService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Organization.name) private readonly orgModel: Model<Organization>,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
  ) {}

  async bootstrap(setupDto: SystemSetupDto) {
    const systemKey = this.configService.get<string>('SYSTEM_ACCESS_KEY');
    if (!systemKey || setupDto.system_key !== systemKey) {
      throw new UnauthorizedException('Invalid system access key');
    }

    // Check if organization exists
    const existingOrg = await this.orgModel.findOne({ slug: setupDto.org_slug });
    if (existingOrg) {
      throw new ConflictException('Organization with this slug already exists');
    }

    // Create Organization
    const organization = new this.orgModel({
      name: setupDto.org_name,
      slug: setupDto.org_slug,
      address: setupDto.org_address,
      timezone: setupDto.org_timezone,
    });
    const savedOrg = await organization.save();

    // Create Admin
    const hashedPassword = await PasswordUtils.hash(setupDto.admin_password);
    const admin = new this.adminModel({
      full_name: setupDto.admin_name,
      email: setupDto.admin_email,
      phone: setupDto.admin_phone,
      password: hashedPassword,
      organization_id: savedOrg._id,
      branch_ids: [],
      is_active: true,
    });
    await admin.save();

    return {
      message: 'System setup completed successfully',
      organization_id: savedOrg._id,
      admin_id: admin._id,
    };
  }
}
