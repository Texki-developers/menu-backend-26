import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schema/category.schema';
import { CreateCategoryDto } from '../dto/create-category.dto';
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
}
