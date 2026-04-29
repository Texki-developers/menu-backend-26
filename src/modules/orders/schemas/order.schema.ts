import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ _id: false })
class OrderItem {
  @Prop({ required: true })
  menu_item_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unit_price: number;

  @Prop({ required: true })
  total_price: number;
}

@Schema({
  collection: 'orders',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Order extends Document {
  @Prop({ required: true, unique: true })
  order_uuid: string;

  @Prop({ required: true })
  organization_id: string;

  @Prop({ required: true })
  branch_id: string;

  @Prop({ type: [OrderItem], default: [] })
  items: OrderItem[];

  @Prop({ required: true })
  total_amount: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop()
  customer_name?: string;

  @Prop()
  customer_phone?: string;

  @Prop()
  table_number?: string;

  @Prop()
  notes?: string;

  created_at: Date;
  updated_at: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ organization_id: 1, branch_id: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ created_at: -1 });
