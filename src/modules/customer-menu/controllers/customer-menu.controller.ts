import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { CustomerMenuService } from '../services/customer-menu.service';
import { GetBranchMenuResponseDto } from '../dto/get-branch-menu.dto';
import { GetProductDetailResponseDto } from '../dto/get-product-detail.dto';

@ApiTags('customer-menu')
@Controller('public/branches')
export class CustomerMenuController {
  constructor(private readonly customerMenuService: CustomerMenuService) {}

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
}
