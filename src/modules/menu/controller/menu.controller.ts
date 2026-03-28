import { Body, Controller, Post, HttpCode, HttpStatus, Get, Patch, Param, Delete, Query } from '@nestjs/common';
import { MenuService } from '../services/menu.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { GetAllMenusDto } from '../dto/get-all-menus.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Menu } from '../schema/menu.schema';
import { OrgId } from 'src/common/decorators/org-id.decorator';
import { BranchId } from 'src/common/decorators/branch-id.decorator';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
    constructor(
        private readonly menuService: MenuService,
    ){}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all menus', description: 'Retrieve all menus with pagination, search, and filters' })
    @ApiResponse({ status: HttpStatus.OK, type: [Menu] })
    async getAllMenus(
        @Query() getAllMenusDto: GetAllMenusDto,
        @OrgId() orgId: string,
        @BranchId() branchId: string
    ) {
        return this.menuService.getAllMenus(getAllMenusDto, orgId, branchId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a menu by ID', description: 'Retrieve a single menu by its ID' })
    @ApiResponse({ status: HttpStatus.OK, type: Menu })
    async getMenuById(@Param('id') id: string, @OrgId() orgId: string, @BranchId() branchId: string) {
        return this.menuService.getMenuById(id, orgId, branchId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new menu', description: 'Create a new menu' })
    @ApiResponse({ status: HttpStatus.CREATED, type: Menu })
    async createMenu(@Body() createMenuDto: CreateMenuDto, @OrgId() orgId: string, @BranchId() branchId: string) {
        return this.menuService.createMenu(createMenuDto, orgId, branchId);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update a menu', description: 'Update a menu by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Menu updated successfully', type: Menu })
    async updateMenu(
        @Param('id') id: string,
        @Body() updateMenuDto: UpdateMenuDto,
        @OrgId() orgId: string,
        @BranchId() branchId: string
    ) {
        return this.menuService.updateMenu(id, updateMenuDto, orgId, branchId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a menu', description: 'Remove a menu by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Menu removed successfully' })
    async removeMenu(@Param('id') id: string, @OrgId() orgId: string, @BranchId() branchId: string) {
        return this.menuService.deleteMenu(id, orgId, branchId);
    }
}
