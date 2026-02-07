import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "./schemas";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private orderModel: Model<Order>,
  ) {}

  createOrder(data: any) {
    return this.orderModel.create(data);
  }

  getBranchOrders(branchId: string) {
    return this.orderModel.find({ branchId }).sort({ createdAt: -1 });
  }
}
