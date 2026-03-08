import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from '../schemas/organization.schema';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { handleDbError } from '../../../common/utils';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name) private organizationModel: Model<Organization>,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    try {
      const organization = new this.organizationModel(dto);
      return await organization.save();
    } catch (error) {
      handleDbError(error, 'creating the organization');
      throw error;
    }
  }

  async findAll(): Promise<Organization[]> {
    try {
      return await this.organizationModel.find().lean();
    } catch (error) {
      handleDbError(error, 'getting all organizations');
      throw error;
    }
  }

  async findOne(id: string): Promise<Organization> {
    try {
      const organization = await this.organizationModel.findById(id).lean();
      if (!organization) throw new NotFoundException('Organization not found');
      return organization as unknown as Organization;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'getting the organization');
      throw error;
    }
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    try {
      const updated = await this.organizationModel.findByIdAndUpdate(
        id,
        { $set: dto },
        { new: true, runValidators: true },
      );
      if (!updated) throw new NotFoundException('Organization not found');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'updating the organization');
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const result = await this.organizationModel.findByIdAndDelete(id);
      if (!result) throw new NotFoundException('Organization not found');
      return { message: 'Organization deleted successfully', id };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'deleting the organization');
      throw error;
    }
  }
}
