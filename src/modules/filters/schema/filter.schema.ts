import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FilterSource, FilterType } from '../constants/constant';

@Schema({ _id: false })
export class FilterOption {
  @Prop({ required: true }) label: string;
  /** Raw value matched against the source field (e.g. "veg", "mild", "spicy", a tag name). */
  @Prop({ required: true }) value: string;
  @Prop({ default: 0 }) sort_order: number;
}
export const FilterOptionSchema = SchemaFactory.createForClass(FilterOption);

@Schema({ _id: false })
export class FilterRange {
  @Prop({ required: true }) label: string;
  @Prop({ required: true, min: 0 }) min: number;
  /** Max is optional — null means "and above". */
  @Prop({ type: Number, default: null }) max: number | null;
  @Prop({ default: 0 }) sort_order: number;
}
export const FilterRangeSchema = SchemaFactory.createForClass(FilterRange);

@Schema({
  collection: 'filters',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Filter extends Document {
  @Prop({ required: true, index: true }) organization_id: string;

  @Prop({ required: true }) name: string;

  @Prop({ type: String, enum: FilterType, required: true }) type: FilterType;

  @Prop({ type: String, enum: FilterSource, required: true }) source: FilterSource;

  @Prop({ type: [FilterOptionSchema], default: [] }) options: FilterOption[];

  @Prop({ type: [FilterRangeSchema], default: [] }) ranges: FilterRange[];

  @Prop({ default: 0 }) sort_order: number;

  @Prop({ default: true }) is_active: boolean;

  created_at: Date;
  updated_at: Date;
}
export const FilterSchema = SchemaFactory.createForClass(Filter);
FilterSchema.index({ organization_id: 1, sort_order: 1 });
