import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schema/category.schema';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { handleDbError } from '../../../common/utils';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<Category>,
        private readonly cloudinaryService: CloudinaryService,
    ){}

    async createCategory(createCategoryDto: CreateCategoryDto, orgId: string, branchId: string): Promise<Category> {
        try {
            const category = new this.categoryModel({
                ...createCategoryDto,
                organization_id: orgId,
                branch_id: createCategoryDto.branch_id || branchId
            });
            return await category.save();
        } catch (error) {
            handleDbError(error, 'creating the category');
            throw error;
        }
    }

    async getAllCategories(orgId: string, branchId: string): Promise<Category[]> {
        try {
            const filter: Record<string, any> = { organization_id: orgId };
            if (branchId) {
                filter.branch_id = branchId;
            }
            return await this.categoryModel.find(filter).lean();
        } catch (error) {
            handleDbError(error, 'getting all categories');
            throw error;
        }
    }

    async getCategoryById(id: string, orgId: string, branchId: string): Promise<Category> {
        try {
            const filter: Record<string, any> = { _id: id, organization_id: orgId };
            if (branchId) {
                filter.branch_id = branchId;
            }
            const category = await this.categoryModel.findOne(filter).lean();
            if (!category) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }
            return category as Category;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, `getting category with ID ${id}`);
            throw error;
        }
    }

    async updateCategory(id: string, updateData: UpdateCategoryDto, orgId: string, branchId: string): Promise<Category> {
        try {
            const filter: Record<string, any> = { _id: id, organization_id: orgId };
            if (branchId) {
                filter.branch_id = branchId;
            }

            const previous = await this.categoryModel.findOne(filter).lean<{ image_public_id?: string }>();

            const updatedCategory = await this.categoryModel.findOneAndUpdate(
                filter,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedCategory) {
                throw new NotFoundException('Category not found');
            }

            const previousPublicId = previous?.image_public_id;
            if (previousPublicId && previousPublicId !== updatedCategory.image_public_id) {
                await this.cloudinaryService.safeDelete(previousPublicId);
            }

            return updatedCategory;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'updating the category');
            throw error;
        }
    }

    async deleteCategory(id: string, orgId: string, branchId: string) {
        try {
            const filter: Record<string, any> = { _id: id, organization_id: orgId };
            if (branchId) {
                filter.branch_id = branchId;
            }
            const result = await this.categoryModel.findOneAndDelete(filter);
            if (!result) {
                throw new NotFoundException('Category not found');
            }
            await this.cloudinaryService.safeDelete(result.image_public_id);
            return result;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'deleting the category');
            throw error;
        }
    }
}
