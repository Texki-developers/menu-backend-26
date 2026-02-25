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

@Injectable()
export class MenuService {
    constructor(
        @InjectModel(Menu.name) private menuModel: Model<Menu>,
        @InjectModel(Category.name) private categoryModel: Model<Category>,
    ){}

    async createMenu(createMenuDto: CreateMenuDto): Promise<Menu> {
        try {
            const menu = new this.menuModel(createMenuDto);
            return await menu.save();
        } catch (error) {
            handleDbError(error, 'creating the menu');
            throw error;
        }
    }

    async getAllMenus(getAllMenusDto: GetAllMenusDto) {
        try {
            const { 
                query, 
                page = '1', 
                limit = '10', 
                organization_id, 
                status, 
                sortBy = 'created_at', 
                sortOrder = SortOrder.DESC 
            } = getAllMenusDto;

            // 1. Build Filter Objects
            const baseFilter: Record<string, any> = {};
            if (organization_id) {
                baseFilter.organization_id = new Types.ObjectId(organization_id);
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
            return await paginate(this.menuModel, {
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
        } catch (error) {
            handleDbError(error, 'getting all menus');
            throw error;
        }
    }

    async getMenuById(id: string): Promise<any> {
        try {
            const results = await this.menuModel.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(id)
                    }
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

            return results[0];
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'getting the menu by id');
            throw error;
        }
    }

    async updateMenu(id: string, updateData: UpdateMenuDto): Promise<Menu> {
        try {
            const updatedMenu = await this.menuModel.findByIdAndUpdate(
                id,
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

    async deleteMenu(id: string) {
        try {
            const result = await this.menuModel.findByIdAndDelete(id);
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
