import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class OrderItem {
  @Prop()
  itemId: string;

  @Prop()
  name: string;

  @Prop()
  variant?: string;

  @Prop()
  price: number;

  @Prop()
  qty: number;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: String, ref: 'Branch', required: true })
  branchId: string;

  @Prop()
  customerId?: string;

  @Prop({ required: true })
  orderType: 'dine_in' | 'takeaway' | 'delivery';

  @Prop({ type: String, ref: 'Table' })
  tableId?: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop()
  totalAmount: number;

  @Prop({ default: 'placed' })
  status: 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}

export const OrderSchema = SchemaFactory.createForClass(Order);
