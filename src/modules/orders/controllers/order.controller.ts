import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrgId } from 'src/common/decorators/org-id.decorator';
import { BranchId } from 'src/common/decorators/branch-id.decorator';
import { Order } from '../schemas/order.schema';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Order })
  async createOrder(
    @Body() dto: CreateOrderDto,
    @OrgId() orgId: string,
    @BranchId() branchId: string,
  ) {
    return this.orderService.createOrder(dto, orgId, branchId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: HttpStatus.OK, type: [Order] })
  async getAllOrders(@OrgId() orgId: string, @BranchId() branchId: string) {
    return this.orderService.getAllOrders(orgId, branchId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: Order })
  async getOrderById(
    @Param('id') id: string,
    @OrgId() orgId: string,
    @BranchId() branchId: string,
  ) {
    return this.orderService.getOrderById(id, orgId, branchId);
  }
}
