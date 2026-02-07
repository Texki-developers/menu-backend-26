import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Table extends Document {
  @Prop({ type: String, ref: 'Branch', required: true })
  branchId: string;

  @Prop({ required: true })
  tableNumber: string;

  @Prop()
  capacity: number;

  @Prop({ default: 'available' })
  status: 'available' | 'occupied' | 'reserved';
}

export const TableSchema = SchemaFactory.createForClass(Table);
