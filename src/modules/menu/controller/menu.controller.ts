import { Body, Controller, Post, HttpCode, HttpStatus, Get, Patch, Param, Delete, Query } from '@nestjs/common';
import { MenuService } from '../services/menu.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { GetAllMenusDto } from '../dto/get-all-menus.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Menu } from '../schema/menu.schema';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
    constructor(
        private readonly menuService: MenuService,
    ){}

    @Get('get-all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all menus', description: 'Retrieve all menus with pagination, search, and filters' })
    @ApiResponse({ status: HttpStatus.OK, type: [Menu] })
    async getAllMenus(@Query() getAllMenusDto: GetAllMenusDto) {
        return this.menuService.getAllMenus(getAllMenusDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a menu by ID', description: 'Retrieve a single menu by its ID' })
    @ApiResponse({ status: HttpStatus.OK, type: Menu })
    async getMenuById(@Param('id') id: string) {
        return this.menuService.getMenuById(id);
    }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new menu', description: 'Create a new menu' })
    @ApiResponse({ status: HttpStatus.CREATED, type: Menu })
    async createMenu(@Body() createMenuDto: CreateMenuDto) {
        return this.menuService.createMenu(createMenuDto);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update a menu', description: 'Update a menu by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Menu updated successfully', type: Menu })
    async updateMenu(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
        return this.menuService.updateMenu(id, updateMenuDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove a menu', description: 'Remove a menu by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Menu removed successfully' })
    async removeMenu(@Param('id') id: string) {
        return this.menuService.deleteMenu(id);
    }
}
