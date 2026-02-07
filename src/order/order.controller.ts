import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { OrdersService } from "./order.service";

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  create(@Body() body) {
    return this.service.createOrder(body);
  }

  @Get(':branchId')
  get(@Param('branchId') branchId: string) {
    return this.service.getBranchOrders(branchId);
  }
}
