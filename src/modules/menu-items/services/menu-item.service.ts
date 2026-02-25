import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem } from '../schemas/menu-item.schema';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { GetAllMenuItemsDto } from '../dto/get-all-menu-items.dto';
import { SortOrder } from '../../../common/interfaces/pagination.interface';
import { handleDbError, paginate } from '../../../common/utils';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
  ) {}

  async createMenuItem(dto: CreateMenuItemDto): Promise<MenuItem> {
    try {
      const item = new this.menuItemModel({
        ...dto,
        menu_item_uuid: `menu_item_${crypto.randomUUID()}`,
      });
      return await item.save();
    } catch (error) {
      handleDbError(error, 'creating the menu item');
      throw error;
    }
  }

  async getAllMenuItems(dto: GetAllMenuItemsDto) {
    try {
      const {
        page = '1',
        limit = '20',
        menu_id,
        category_id,
        organization_id,
        branch_id,
        is_available,
        is_featured,
        sortBy = 'sort_order',
        sortOrder = SortOrder.ASC,
      } = dto;

      const baseFilter: Record<string, any> = {};
      if (organization_id) baseFilter.organization_id = new Types.ObjectId(organization_id);
      if (branch_id) baseFilter.branch_id = new Types.ObjectId(branch_id);

      const searchFilter: Record<string, any> = {};
      if (menu_id) searchFilter.menu_id = new Types.ObjectId(menu_id);
      if (category_id) searchFilter.category_id = new Types.ObjectId(category_id);
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

  async getMenuItemById(id: string): Promise<MenuItem> {
    try {
      const item = await this.menuItemModel
        .findById(id)
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

  async updateMenuItem(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    try {
      const updated = await this.menuItemModel.findByIdAndUpdate(
        id,
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

  async deleteMenuItem(id: string) {
    try {
      const result = await this.menuItemModel.findByIdAndDelete(id);
      if (!result) throw new NotFoundException('Menu item not found');
      return { message: 'Menu item deleted successfully', id };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'deleting the menu item');
      throw error;
    }
  }
}
