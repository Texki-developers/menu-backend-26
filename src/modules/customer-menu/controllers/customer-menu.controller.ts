import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { CustomerMenuService } from '../services/customer-menu.service';
import { GetBranchMenuResponseDto } from '../dto/get-branch-menu.dto';
import { GetProductDetailResponseDto } from '../dto/get-product-detail.dto';
import { ListMenusResponseDto } from '../dto/list-menus.dto';
import { ListCategoriesResponseDto } from '../dto/list-categories.dto';
import { ListItemsResponseDto } from '../dto/list-items.dto';
import { GetBranchResponseDto } from '../dto/get-branch.dto';

@ApiTags('customer-menu')
@Controller('public/branches')
export class CustomerMenuController {
  constructor(private readonly customerMenuService: CustomerMenuService) {}

  @Public()
  @Get(':branchId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get branch details only',
    description:
      'Lightweight public endpoint returning just branch info — name, phone, address, operating hours. No categories or items.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetBranchResponseDto })
  async getBranch(@Param('branchId') branchId: string): Promise<GetBranchResponseDto> {
    return this.customerMenuService.getBranch(branchId);
  }

  @Public()
  @Get(':branchId/menu')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get full branch menu for customer',
    description:
      'Public endpoint used by the customer-facing app (QR code entry). Returns branch info + categories with available menu items (product data merged in).',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetBranchMenuResponseDto })
  async getBranchMenu(@Param('branchId') branchId: string): Promise<GetBranchMenuResponseDto> {
    return this.customerMenuService.getBranchMenu(branchId);
  }

  @Public()
  @Get(':branchId/items/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get full product detail for customer',
    description:
      'Public endpoint for the product detail page. Returns the menu item with product data, variants, extras, notes, and branch context.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetProductDetailResponseDto })
  async getProductDetail(
    @Param('branchId') branchId: string,
    @Param('slug') slug: string,
  ): Promise<GetProductDetailResponseDto> {
    return this.customerMenuService.getProductDetail(branchId, slug);
  }

  @Public()
  @Get(':branchId/menus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List active menus for a branch',
    description:
      'Public endpoint listing all ACTIVE menus for a branch with their schedule windows. Includes is_currently_active so the frontend can decide what to surface.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: ListMenusResponseDto })
  async listMenus(@Param('branchId') branchId: string): Promise<ListMenusResponseDto> {
    return this.customerMenuService.listMenus(branchId);
  }

  @Public()
  @Get(':branchId/menus/:menuId/categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List categories with available items under a menu',
    description:
      'Public endpoint returning categories that have at least one available menu item under the given branch + menu. Includes item_count.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: ListCategoriesResponseDto })
  async listCategoriesForMenu(
    @Param('branchId') branchId: string,
    @Param('menuId') menuId: string,
  ): Promise<ListCategoriesResponseDto> {
    return this.customerMenuService.listCategoriesForMenu(branchId, menuId);
  }

  @Public()
  @Get(':branchId/categories/:categoryId/items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List available items in a category under a menu',
    description:
      'Public endpoint returning available menu items in this category under the given menu, with product data merged in.',
  })
  @ApiQuery({ name: 'menuId', required: true, type: String })
  @ApiResponse({ status: HttpStatus.OK, type: ListItemsResponseDto })
  async listItemsForCategory(
    @Param('branchId') branchId: string,
    @Param('categoryId') categoryId: string,
    @Query('menuId') menuId: string,
  ): Promise<ListItemsResponseDto> {
    return this.customerMenuService.listItemsForCategory(branchId, categoryId, menuId);
  }
}
