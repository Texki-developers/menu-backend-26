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
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { CartService } from '../services/cart.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { MergeCartDto } from '../dto/merge-cart.dto';
import { CartResponseDto } from '../dto/cart-response.dto';
import { CartToken } from '../decorators/cart-token.decorator';

@ApiTags('cart')
@ApiHeader({ name: 'x-cart-token', required: true, description: 'Stable per-device cart UUID' })
@Controller('public/branches/:branchId/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current cart for this branch (guest or user)' })
  @ApiResponse({ status: HttpStatus.OK, type: CartResponseDto })
  async get(
    @Param('branchId') branchId: string,
    @CartToken() cartToken: string,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(branchId, { cart_token: cartToken });
  }

  @Public()
  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add an item to the cart (idempotent via cart_item_id)' })
  async addItem(
    @Param('branchId') branchId: string,
    @CartToken() cartToken: string,
    @Body() dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(branchId, { cart_token: cartToken }, dto);
  }

  @Public()
  @Patch('items/:cartItemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update quantity / variant / extras / note for a cart line' })
  async updateItem(
    @Param('branchId') branchId: string,
    @Param('cartItemId') cartItemId: string,
    @CartToken() cartToken: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItem(branchId, { cart_token: cartToken }, cartItemId, dto);
  }

  @Public()
  @Delete('items/:cartItemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a line from the cart' })
  async removeItem(
    @Param('branchId') branchId: string,
    @Param('cartItemId') cartItemId: string,
    @CartToken() cartToken: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeItem(branchId, { cart_token: cartToken }, cartItemId);
  }

  @Public()
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear the cart for this branch' })
  async clear(
    @Param('branchId') branchId: string,
    @CartToken() cartToken: string,
  ): Promise<void> {
    await this.cartService.clearCart(branchId, { cart_token: cartToken });
  }

  // ────────────── Authenticated — called right after OTP verify ─────────
  @ApiBearerAuth()
  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Merge a guest cart into the authenticated user cart (post-login)',
    description:
      'Called after the customer verifies their OTP. Dedupes lines with identical (item, variant, extras) by summing quantities.',
  })
  async merge(
    @Param('branchId') branchId: string,
    @CartToken() cartToken: string,
    @Body() dto: MergeCartDto,
    @Req() req: Request,
  ): Promise<CartResponseDto> {
    const user = req.user as { userId?: string } | undefined;
    return this.cartService.mergeGuestCart(
      branchId,
      user?.userId ?? '',
      cartToken,
      dto.guest_cart_token,
    );
  }
}
