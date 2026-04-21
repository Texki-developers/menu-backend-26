import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SortDirection, SortField } from '../constants/constant';

@Schema({
  collection: 'sort_options',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class SortOption extends Document {
  @Prop({ required: true, index: true }) organization_id: string;

  @Prop({ required: true }) label: string;

  @Prop({ type: String, enum: SortField, required: true }) field: SortField;

  @Prop({ type: String, enum: SortDirection, required: true }) direction: SortDirection;

  @Prop({ default: false }) is_default: boolean;

  @Prop({ default: 0 }) sort_order: number;

  @Prop({ default: true }) is_active: boolean;

  created_at: Date;
  updated_at: Date;
}
export const SortOptionSchema = SchemaFactory.createForClass(SortOption);
SortOptionSchema.index({ organization_id: 1, sort_order: 1 });
