import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenuItemService } from '../services/menu-item.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { GetAllMenuItemsDto } from '../dto/get-all-menu-items.dto';
import { MenuItem } from '../schemas/menu-item.schema';

@ApiTags('menu-items')
@Controller('menu-items')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a menu item', description: 'Add a product to a menu' })
  @ApiResponse({ status: HttpStatus.CREATED, type: MenuItem })
  async createMenuItem(@Body() dto: CreateMenuItemDto) {
    return this.menuItemService.createMenuItem(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all menu items (flat list)',
    description:
      'Retrieve all menu items without pagination. Optional filters: menuId, categoryId, organizationId, branchId',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [MenuItem] })
  async getFlatMenuItems(
    @Query('menuId') menuId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('organizationId') organizationId?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.menuItemService.getFlatMenuItems(
      menuId,
      categoryId,
      organizationId,
      branchId,
    );
  }

  @Get('get-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List menu items (paginated)',
    description: 'Filter by menu_id, category_id, branch_id etc.',
  })
  async getAllMenuItems(@Query() dto: GetAllMenuItemsDto) {
    return this.menuItemService.getAllMenuItems(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a menu item by ID (with product details populated)' })
  @ApiResponse({ status: HttpStatus.OK, type: MenuItem })
  async getMenuItemById(@Param('id') id: string) {
    return this.menuItemService.getMenuItemById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiResponse({ status: HttpStatus.OK, type: MenuItem })
  async updateMenuItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuItemService.updateMenuItem(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a menu item' })
  async deleteMenuItem(@Param('id') id: string) {
    return this.menuItemService.deleteMenuItem(id);
  }
}
