import { Body, Controller, Post, HttpCode, HttpStatus, Get } from '@nestjs/common';
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

    @Get('get-all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all categories', description: 'Retrieve all menu categories' })
    @ApiResponse({ status: HttpStatus.OK, type: [Category] })
    async getAllCategories() {
        return this.categoryService.getAllCategories();
    }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new category', description: 'Create a new category for the menu' })
    @ApiResponse({ status: HttpStatus.CREATED, type: Category })
    async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.createCategory(createCategoryDto);
    }
}
