import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem } from '../schemas/menu-item.schema';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { GetAllMenuItemsDto } from '../dto/get-all-menu-items.dto';
import { SortOrder } from '../../../common/interfaces/pagination.interface';
import { handleDbError, paginate } from '../../../common/utils';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createMenuItem(dto: CreateMenuItemDto, orgId: string, branchId: string): Promise<MenuItem> {
    try {
      const item = new this.menuItemModel({
        ...dto,
        organization_id: orgId,
        branch_id: dto.branch_id || branchId,
        menu_item_uuid: `menu_item_${crypto.randomUUID()}`,
      });
      return await item.save();
    } catch (error) {
      handleDbError(error, 'creating the menu item');
      throw error;
    }
  }

  async getFlatMenuItems(
    orgId: string,
    branchId: string,
    menu_id?: string,
    category_id?: string,
  ): Promise<MenuItem[]> {
    try {
      const filter: Record<string, any> = { organization_id: orgId };
      if (branchId) {
        filter.branch_id = branchId;
      }
      if (menu_id) filter.menu_id = menu_id;
      if (category_id) filter.category_id = category_id;

      return await this.menuItemModel
        .find(filter)
        .populate('product_id', 'name slug type spice_level calories media allergens tags')
        .lean();
    } catch (error) {
      handleDbError(error, 'getting flat menu items');
      throw error;
    }
  }

  async getAllMenuItems(dto: GetAllMenuItemsDto, orgId: string, branchId: string) {
    try {
      const {
        page = '1',
        limit = '20',
        menu_id,
        category_id,
        is_available,
        is_featured,
        sortBy = 'sort_order',
        sortOrder = SortOrder.ASC,
      } = dto;
      console.log("🚀 ~ MenuItemService ~ getAllMenuItems ~ dto:", dto)
      const baseFilter: Record<string, any> = { organization_id: orgId };
      if (branchId) {
        baseFilter.branch_id = branchId;
      }

      const searchFilter: Record<string, any> = {};
      if (menu_id) searchFilter.menu_id = menu_id;
      if (category_id) searchFilter.category_id = category_id;
      if (is_available !== undefined) searchFilter.is_available = is_available;
      if (is_featured !== undefined) searchFilter.is_featured = is_featured;


      return await paginate(this.menuItemModel, {
        page,
        limit,
        sortBy,
        sortOrder: sortOrder as any,
        baseFilter,
        searchFilter,
        extraFacets: {
          totalAvailable: [
            { $match: { is_available: true } },
            { $count: 'count' },
          ],
        },
      });
    } catch (error) {
      handleDbError(error, 'getting all menu items');
      throw error;
    }
  }

  async getMenuItemById(id: string, orgId: string, branchId: string): Promise<MenuItem> {
    try {
      const filter: Record<string, any> = { _id: id, organization_id: orgId };
      if (branchId) {
        filter.branch_id = branchId;
      }
      const item = await this.menuItemModel
        .findOne(filter)
        .populate('product_id', 'name slug type spice_level calories media allergens tags')
        .lean();
      if (!item) throw new NotFoundException('Menu item not found');
      return item as unknown as MenuItem;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'getting the menu item');
      throw error;
    }
  }

  async updateMenuItem(id: string, dto: UpdateMenuItemDto, orgId: string, branchId: string): Promise<MenuItem> {
    try {
      const filter: Record<string, any> = { _id: id, organization_id: orgId };
      if (branchId) {
        filter.branch_id = branchId;
      }
      const updated = await this.menuItemModel.findOneAndUpdate(
        filter,
        { $set: dto },
        { new: true, runValidators: true },
      );
      if (!updated) throw new NotFoundException('Menu item not found');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'updating the menu item');
      throw error;
    }
  }

  async deleteMenuItem(id: string, orgId: string, branchId: string) {
    try {
      const filter: Record<string, any> = { _id: id, organization_id: orgId };
      if (branchId) {
        filter.branch_id = branchId;
      }
      const result = await this.menuItemModel.findOneAndDelete(filter);
      if (!result) throw new NotFoundException('Menu item not found');

      const overrideMedia = (result.media ?? []) as Array<{ public_id?: string }>;
      await this.cloudinaryService.safeDeleteMany(
        overrideMedia.map((m) => m?.public_id),
      );

      return { message: 'Menu item deleted successfully', id };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'deleting the menu item');
      throw error;
    }
  }
}
