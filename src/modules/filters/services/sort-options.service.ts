import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { handleDbError } from '../../../common/utils';
import { SortOption } from '../schema/sort-option.schema';
import { CreateSortOptionDto } from '../dto/create-sort-option.dto';
import { UpdateSortOptionDto } from '../dto/update-sort-option.dto';

@Injectable()
export class SortOptionsService {
  constructor(@InjectModel(SortOption.name) private readonly sortModel: Model<SortOption>) {}

  async list(orgId: string): Promise<SortOption[]> {
    try {
      return await this.sortModel
        .find({ organization_id: orgId })
        .sort({ sort_order: 1, created_at: 1 })
        .lean();
    } catch (error) {
      handleDbError(error, 'listing sort options');
      throw error;
    }
  }

  async listActive(orgId: string): Promise<SortOption[]> {
    try {
      return await this.sortModel
        .find({ organization_id: orgId, is_active: true })
        .sort({ sort_order: 1, created_at: 1 })
        .lean();
    } catch (error) {
      handleDbError(error, 'listing active sort options');
      throw error;
    }
  }

  async getById(id: string, orgId: string): Promise<SortOption> {
    const doc = await this.sortModel.findOne({ _id: id, organization_id: orgId }).lean();
    if (!doc) throw new NotFoundException('Sort option not found');
    return doc as SortOption;
  }

  async create(dto: CreateSortOptionDto, orgId: string): Promise<SortOption> {
    try {
      if (dto.is_default) await this.clearDefault(orgId);
      return await this.sortModel.create({ ...dto, organization_id: orgId });
    } catch (error) {
      handleDbError(error, 'creating sort option');
      throw error;
    }
  }

  async update(id: string, dto: UpdateSortOptionDto, orgId: string): Promise<SortOption> {
    try {
      if (dto.is_default) await this.clearDefault(orgId, id);
      const updated = await this.sortModel.findOneAndUpdate(
        { _id: id, organization_id: orgId },
        { $set: dto },
        { new: true, runValidators: true },
      );
      if (!updated) throw new NotFoundException('Sort option not found');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'updating sort option');
      throw error;
    }
  }

  async remove(id: string, orgId: string): Promise<{ deleted: boolean }> {
    const res = await this.sortModel.findOneAndDelete({ _id: id, organization_id: orgId });
    if (!res) throw new NotFoundException('Sort option not found');
    return { deleted: true };
  }

  private async clearDefault(orgId: string, except?: string): Promise<void> {
    const filter: Record<string, unknown> = { organization_id: orgId, is_default: true };
    if (except) filter._id = { $ne: except };
    await this.sortModel.updateMany(filter, { $set: { is_default: false } });
  }
}
