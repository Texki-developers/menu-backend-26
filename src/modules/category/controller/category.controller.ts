import { Body, Controller, Post, HttpCode, HttpStatus, Get, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { OrgId } from 'src/common/decorators/org-id.decorator';
import { BranchId } from 'src/common/decorators/branch-id.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Category } from '../schema/category.schema';

@ApiTags('category')
@Controller('category')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
    ){}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all categories', description: 'Retrieve all menu categories' })
    @ApiResponse({ status: HttpStatus.OK, type: [Category] })
    async getAllCategories(@OrgId() orgId: string, @BranchId() branchId: string) {
        return this.categoryService.getAllCategories(orgId, branchId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a single category', description: 'Retrieve a category by its ID' })
    @ApiResponse({ status: HttpStatus.OK, type: Category })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
    async getCategoryById(@Param('id') id: string, @OrgId() orgId: string, @BranchId() branchId: string) {
        return this.categoryService.getCategoryById(id, orgId, branchId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new category', description: 'Create a new category for the menu' })
    @ApiResponse({ status: HttpStatus.CREATED, type: Category })
    async createCategory(@Body() createCategoryDto: CreateCategoryDto, @OrgId() orgId: string, @BranchId() branchId: string) {
        return this.categoryService.createCategory(createCategoryDto, orgId, branchId);
    } 

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update a category', description: 'Update a category by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Category updated successfully', type: Category })
    async updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @OrgId() orgId: string, @BranchId() branchId: string) {
        return this.categoryService.updateCategory(id, updateCategoryDto, orgId, branchId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a category', description: 'Remove a category by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Category removed successfully' })
    async deleteCategory(@Param('id') id: string, @OrgId() orgId: string, @BranchId() branchId: string) {
        return this.categoryService.deleteCategory(id, orgId, branchId);
    }
}
