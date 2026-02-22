import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Category } from '../schema/category.schema';

@ApiTags('category')
@Controller('category')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
    ){}

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new category', description: 'Create a new category for the menu' })
    @ApiResponse({ status: HttpStatus.CREATED, type: Category })
    async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.createCategory(createCategoryDto);
    }
}
