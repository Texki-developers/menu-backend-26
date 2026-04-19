import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Sse,
  Patch,
  MessageEvent,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable, fromEvent, map, filter, merge, timer } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { GetAllOrdersDto } from '../dto/get-all-orders.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrgId } from 'src/common/decorators/org-id.decorator';
import { BranchId } from 'src/common/decorators/branch-id.decorator';
import { Order } from '../schemas/order.schema';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
  async getAllOrders(
    @Query() dto: GetAllOrdersDto,
    @OrgId() orgId: string,
    @BranchId() branchId: string,
  ) {
    return this.orderService.getAllOrders(dto, orgId, branchId);
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Stream new orders real-time' })
  stream(
    @OrgId() orgId: string,
    @BranchId() branchId: string | null,
  ): Observable<MessageEvent> {
    const orderCreated = fromEvent(this.eventEmitter, 'order.created').pipe(
      map((order: any) => ({ data: JSON.stringify(order), type: 'order.created' }) as MessageEvent)
    );

    const orderUpdated = fromEvent(this.eventEmitter, 'order.updated').pipe(
      map((order: any) => ({ data: JSON.stringify(order), type: 'order.updated' }) as MessageEvent)
    );

    const orderEvents = merge(orderCreated, orderUpdated).pipe(
      filter((event: MessageEvent) => {
        const order = JSON.parse(event.data as string);
        const orderOrgId = order.organization_id?.toString();
        const orderBranchId = order.branch_id?.toString();

        const matchOrg = orderOrgId === orgId?.toString();
        const matchBranch = branchId
          ? orderBranchId === branchId.toString()
          : true;

        return matchOrg && matchBranch;
      }),
    );

    // Add a heartbeat every 30 seconds to keep the connection alive
    const heartbeat = timer(0, 30000).pipe(
      map(() => ({ data: 'heartbeat', type: 'ping' }) as MessageEvent),
    );

    return merge(orderEvents, heartbeat);
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

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: HttpStatus.OK, type: Order })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @OrgId() orgId: string,
    @BranchId() branchId: string | null,
  ) {
    return this.orderService.updateOrderStatus(id, dto.status, orgId, branchId);
  }
}
