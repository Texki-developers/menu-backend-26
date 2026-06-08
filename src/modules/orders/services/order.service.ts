import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Order, OrderStatus } from '../schemas/order.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { PublicCheckoutDto } from '../dto/public-checkout.dto';
import { handleDbError, paginate } from '../../../common/utils';
import { GetAllOrdersDto } from '../dto/get-all-orders.dto';
import { SortOrder } from '../../../common/interfaces/pagination.interface';
import { CartService } from '../../cart/services/cart.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly eventEmitter: EventEmitter2,
    private readonly cartService: CartService,
  ) {}

  async createOrder(dto: CreateOrderDto, orgId: string, branchId: string): Promise<Order> {
    try {
      const items = dto.items.map((item) => ({
        ...item,
        total_price: item.quantity * item.unit_price,
      }));

      const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);

      const order = new this.orderModel({
        ...dto,
        items,
        total_amount,
        organization_id: orgId,
        branch_id: dto.branch_id || branchId,
        order_uuid: `order_${crypto.randomUUID()}`,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await order.save();

      // Emit event for real-time notifications
      this.eventEmitter.emit('order.created', savedOrder);

      return savedOrder;
    } catch (error) {
      handleDbError(error, 'creating the order');
      throw error;
    }
  }

  async getAllOrders(dto: GetAllOrdersDto, orgId: string, branchId: string) {
    try {
      const {
        page = '1',
        limit = '10',
        status,
        search,
        sortBy = 'created_at',
        sortOrder = SortOrder.DESC,
      } = dto;

      const baseFilter: Record<string, any> = { organization_id: orgId };
      if (branchId) {
        baseFilter.branch_id = branchId;
      }

      const searchFilter: Record<string, any> = {};
      if (status) searchFilter.status = status;

      if (search && search.trim() !== '') {
        searchFilter.$or = [
          { order_uuid: { $regex: search, $options: 'i' } },
          { customer_name: { $regex: search, $options: 'i' } },
          { table_number: { $regex: search, $options: 'i' } },
        ];
      }

      return await paginate(this.orderModel, {
        page,
        limit,
        sortBy,
        sortOrder,
        baseFilter,
        searchFilter,
      });
    } catch (error) {
      handleDbError(error, 'getting all orders');
      throw error;
    }
  }

  async getOrderById(id: string, orgId: string, branchId: string): Promise<Order> {
    try {
      const filter: Record<string, any> = { _id: id, organization_id: orgId };
      if (branchId) {
        filter.branch_id = branchId;
      }
      const order = await this.orderModel.findOne(filter).exec();
      if (!order) throw new NotFoundException('Order not found');
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDbError(error, 'getting the order');
      throw error;
    }
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    orgId: string,
    branchId: string | null,
  ): Promise<Order> {
    try {
      // 1. Fetch the order first to verify ownership
      const order = await this.orderModel.findById(id).exec();
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // 2. Strict Organization Check
      if (order.organization_id.toString() !== orgId) {
        throw new ForbiddenException('You do not have permission to access this order');
      }

      // 3. Strict Branch Check (for Staff members)
      // If branchId is provided (from decorator for Staff), it must match the order's branch
      if (branchId && order.branch_id.toString() !== branchId) {
        throw new ForbiddenException('You do not have permission to access this order from this branch');
      }

      // 4. Update the status
      order.status = status;
      const updatedOrder = await order.save();

      // Emit event for real-time notifications
      this.eventEmitter.emit('order.updated', updatedOrder);

      return updatedOrder;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      handleDbError(error, 'updating the order status');
      throw error;
    }
  }

  /**
   * Guest checkout: turns the active cart (resolved from the cart token) into a
   * frozen order, then clears the cart. No authentication required — org/branch
   * are derived from the cart, prices are frozen at this moment.
   */
  async checkoutFromCart(
    branchId: string,
    cartToken: string,
    dto: PublicCheckoutDto,
  ): Promise<Order> {
    if (!cartToken) {
      throw new BadRequestException('Missing cart token');
    }

    const cart = await this.cartService.getCart(branchId, {
      cart_token: cartToken,
    });

    const availableLines = cart.items.filter((l) => l.is_available);
    if (availableLines.length === 0) {
      throw new BadRequestException(
        'Your cart is empty or its items are no longer available',
      );
    }

    try {
      const items = availableLines.map((l) => ({
        menu_item_id: l.menu_item_id,
        name: l.name,
        quantity: l.quantity,
        unit_price: l.unit_price,
        total_price: l.unit_price * l.quantity,
      }));
      const total_amount = items.reduce((sum, i) => sum + i.total_price, 0);

      const order = new this.orderModel({
        order_uuid: `order_${crypto.randomUUID()}`,
        organization_id: cart.organization_id,
        branch_id: branchId,
        items,
        total_amount,
        status: OrderStatus.PENDING,
        order_type: dto.order_type,
        table_number: dto.table_number,
        customer_name: dto.customer_name,
        customer_phone: dto.customer_phone,
        notes: dto.notes,
      });

      const savedOrder = await order.save();
      this.eventEmitter.emit('order.created', savedOrder);

      // Empty the cart now that it's been ordered.
      await this.cartService.clearCart(branchId, { cart_token: cartToken });

      return savedOrder;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      handleDbError(error, 'placing the order');
      throw error;
    }
  }

  /** Public order lookup for the confirmation screen — scoped to its branch. */
  async getPublicOrder(branchId: string, orderId: string): Promise<Order> {
    if (!isValidObjectId(orderId)) {
      throw new BadRequestException('Invalid order id');
    }
    try {
      const order = await this.orderModel
        .findOne({ _id: orderId, branch_id: branchId })
        .exec();
      if (!order) throw new NotFoundException('Order not found');
      return order;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      handleDbError(error, 'getting the order');
      throw error;
    }
  }
}
