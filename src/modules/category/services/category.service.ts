import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schema/category.schema';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { handleDbError } from '../../../common/utils';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<Category>,
    ){}

    async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
        try {
            const category = new this.categoryModel(createCategoryDto);
            return await category.save();
        } catch (error) {
            handleDbError(error, 'creating the category');
            throw error;
        }
    }

    async getAllCategories(): Promise<Category[]> {
        try {
            return await this.categoryModel.find().lean();
        } catch (error) {
            handleDbError(error, 'getting all categories');
            throw error;
        }
    }

    async updateCategory(id: string, updateData: UpdateCategoryDto): Promise<Category> {
        try {
            const updatedCategory = await this.categoryModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedCategory) {
                throw new NotFoundException('Category not found');
            }

            return updatedCategory;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'updating the category');
            throw error;
        }
    }

    async deleteCategory(id: string) {
        try {
            const result = await this.categoryModel.findByIdAndDelete(id);
            if (!result) {
                throw new NotFoundException('Category not found');
            }
            return result;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'deleting the category');
            throw error;
        }
    }
}
