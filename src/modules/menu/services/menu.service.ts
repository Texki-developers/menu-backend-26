import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Menu } from '../schema/menu.schema';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { GetAllMenusDto } from '../dto/get-all-menus.dto';
import { SortOrder } from '../../../common/interfaces/pagination.interface';
import { handleDbError, escapeRegex, paginate } from '../../../common/utils';
import { Category } from '../../category/schema/category.schema';
import { isMenuActiveAt } from '../utils/menu-schedule';

@Injectable()
export class MenuService {
    constructor(
        @InjectModel(Menu.name) private menuModel: Model<Menu>,
        @InjectModel(Category.name) private categoryModel: Model<Category>,
    ){}

    async createMenu(createMenuDto: CreateMenuDto, orgId: string, branchId: string): Promise<Menu> {
        try {
            const menu = new this.menuModel({
                ...createMenuDto,
                organization_id: orgId,
                branch_id: createMenuDto.branch_id || branchId
            });
            return await menu.save();
        } catch (error) {
            handleDbError(error, 'creating the menu');
            throw error;
        }
    }

    async getAllMenus(getAllMenusDto: GetAllMenusDto, orgId: string, branchId: string) {
        try {
            const { 
                query, 
                page = '1', 
                limit = '10', 
                status, 
                sortBy = 'created_at', 
                sortOrder = SortOrder.DESC 
            } = getAllMenusDto;

            // 1. Build Filter Objects
            const baseFilter: Record<string, any> = {
                organization_id: orgId
            };
            if (branchId) {
                baseFilter.branch_id = branchId;
            }

            const searchFilter: Record<string, any> = {};
            if (status) {
                searchFilter.status = status;
            }

            if (query) {
                const safeQuery = escapeRegex(query);
                searchFilter.$or = [
                    { name: { $regex: safeQuery, $options: 'i' } },
                    { description: { $regex: safeQuery, $options: 'i' } }
                ];
            }

            // 2. Execute Paginated Search
            const result = await paginate(this.menuModel, {
                page,
                limit,
                sortBy,
                sortOrder: sortOrder as any,
                baseFilter,
                searchFilter,
                extraFacets: {
                    totalActive: [
                        { $match: { status: 'active' } },
                        { $count: 'count' }
                    ]
                }
            });

            const now = new Date();
            const data = (result.data as any[]).map((m) => ({
                ...m,
                is_currently_active:
                    m.status === 'active' && m.isActive !== false && isMenuActiveAt(m.schedule, now),
            }));
            return { ...result, data };
        } catch (error) {
            handleDbError(error, 'getting all menus');
            throw error;
        }
    }

    async getMenuById(id: string, orgId: string, branchId: string): Promise<any> {
        try {
            const match: Record<string, any> = {
                _id: new Types.ObjectId(id),
                organization_id: orgId
            };
            if (branchId) {
                match.branch_id = branchId;
            }

            const results = await this.menuModel.aggregate([
                {
                    $match: match
                },
                {
                    $lookup: {
                        from: 'categories',
                        let: { menu_id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: [{ $toString: '$menuId' }, { $toString: '$$menu_id' }]
                                    }
                                }
                            }
                        ],
                        as: 'categories'
                    }
                }
            ]);

            if (!results || results.length === 0) {
                throw new NotFoundException('Menu not found');
            }

            const menu = results[0];
            return {
                ...menu,
                is_currently_active:
                    menu.status === 'active' && menu.isActive !== false && isMenuActiveAt(menu.schedule),
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'getting the menu by id');
            throw error;
        }
    }

    async updateMenu(id: string, updateData: UpdateMenuDto, orgId: string, branchId: string): Promise<Menu> {
        try {
            const filter: Record<string, any> = { _id: id, organization_id: orgId };
            if (branchId) {
                filter.branch_id = branchId;
            }

            const updatedMenu = await this.menuModel.findOneAndUpdate(
                filter,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedMenu) {
                throw new NotFoundException('Menu not found');
            }

            return updatedMenu;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'updating the menu');
            throw error;
        }
    }

    async deleteMenu(id: string, orgId: string, branchId: string) {
        try {
            const filter: Record<string, any> = {
                _id: id,
                organization_id: orgId
            };
            if (branchId) {
                filter.branch_id = branchId;
            }

            const result = await this.menuModel.findOneAndDelete(filter);
            if (!result) {
                throw new NotFoundException('Menu not found');
            }
            return result;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'deleting the menu');
            throw error;
        }
    }
}
