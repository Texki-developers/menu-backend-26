import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { OrderService } from '../services/order.service';
import { PublicCheckoutDto } from '../dto/public-checkout.dto';
import { Order } from '../schemas/order.schema';

@ApiTags('public-orders')
@Controller('public/branches/:branchId')
export class PublicOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Public()
  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Place an order from the guest cart (no auth)',
    description:
      'Converts the active cart (identified by the x-cart-token header) into an order and clears the cart.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: Order })
  async checkout(
    @Param('branchId') branchId: string,
    @Headers('x-cart-token') cartToken: string,
    @Body() dto: PublicCheckoutDto,
  ): Promise<Order> {
    return this.orderService.checkoutFromCart(branchId, cartToken, dto);
  }

  @Public()
  @Get('orders/:orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single order (confirmation screen)' })
  @ApiResponse({ status: HttpStatus.OK, type: Order })
  async getOrder(
    @Param('branchId') branchId: string,
    @Param('orderId') orderId: string,
  ): Promise<Order> {
    return this.orderService.getPublicOrder(branchId, orderId);
  }
}
