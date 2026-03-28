import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from '../schemas/order.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { handleDbError, paginate } from '../../../common/utils';
import { GetAllOrdersDto } from '../dto/get-all-orders.dto';
import { SortOrder } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
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

      return await order.save();
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
}
