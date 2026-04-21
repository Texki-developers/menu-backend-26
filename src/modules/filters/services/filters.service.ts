import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { handleDbError } from '../../../common/utils';
import { Filter } from '../schema/filter.schema';
import { CreateFilterDto } from '../dto/create-filter.dto';
import { UpdateFilterDto } from '../dto/update-filter.dto';
import { FilterType } from '../constants/constant';

@Injectable()
export class FiltersService {
  constructor(@InjectModel(Filter.name) private readonly filterModel: Model<Filter>) {}

  async list(orgId: string): Promise<Filter[]> {
    try {
      return await this.filterModel
        .find({ organization_id: orgId })
        .sort({ sort_order: 1, created_at: 1 })
        .lean();
    } catch (error) {
      handleDbError(error, 'listing filters');
      throw error;
    }
  }

  async listActive(orgId: string): Promise<Filter[]> {
    try {
      return await this.filterModel
        .find({ organization_id: orgId, is_active: true })
        .sort({ sort_order: 1, created_at: 1 })
        .lean();
    } catch (error) {
      handleDbError(error, 'listing active filters');
      throw error;
    }
  }

  async getById(id: string, orgId: string): Promise<Filter> {
    const doc = await this.filterModel.findOne({ _id: id, organization_id: orgId }).lean();
    if (!doc) throw new NotFoundException('Filter not found');
    return doc as Filter;
  }

  async create(dto: CreateFilterDto, orgId: string): Promise<Filter> {
    this.validatePayload(dto.type, dto.options, dto.ranges);
    try {
      return await this.filterModel.create({ ...dto, organization_id: orgId });
    } catch (error) {
      handleDbError(error, 'creating filter');
      throw error;
    }
  }

  async update(id: string, dto: UpdateFilterDto, orgId: string): Promise<Filter> {
    const nextType = dto.type;
    if (nextType) this.validatePayload(nextType, dto.options, dto.ranges);
    try {
      const updated = await this.filterModel.findOneAndUpdate(
        { _id: id, organization_id: orgId },
        { $set: dto },
        { new: true, runValidators: true },
      );
      if (!updated) throw new NotFoundException('Filter not found');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'updating filter');
      throw error;
    }
  }

  async remove(id: string, orgId: string): Promise<{ deleted: boolean }> {
    const res = await this.filterModel.findOneAndDelete({ _id: id, organization_id: orgId });
    if (!res) throw new NotFoundException('Filter not found');
    return { deleted: true };
  }

  private validatePayload(
    type: FilterType,
    options: CreateFilterDto['options'],
    ranges: CreateFilterDto['ranges'],
  ): void {
    if (type === FilterType.RANGE) {
      if (!ranges?.length) throw new BadRequestException('Range filter requires at least one range');
    } else {
      if (!options?.length) throw new BadRequestException('Select filter requires at least one option');
    }
  }
}
