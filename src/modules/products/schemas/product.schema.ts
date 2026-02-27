import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MediaFormat, MediaType, ProductType, SpiceLevel } from '../constants/constant';

@Schema({
  collection: 'products',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Product extends Document {
  // ── Identity ─────────────────────────────────────────────────
  @Prop({ required: true, unique: true })
  product_uuid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop()
  sku?: string;

  // ── Classification ────────────────────────────────────────────
  @Prop({ type: String, enum: ProductType, required: true })
  type: ProductType;

  @Prop({ type: String, enum: SpiceLevel, default: SpiceLevel.NONE })
  spice_level: SpiceLevel;

  @Prop({ default: false })
  is_alcohol: boolean;

  @Prop({ default: false })
  is_featured: boolean;

  // ── Pricing ───────────────────────────────────────────────────
  @Prop({ required: true })
  base_price: number;

  @Prop({ required: true })
  base_tax_rate: number;

  // ── Nutrition ─────────────────────────────────────────────────
  /**
   * Calorie count in kcal (useful for health-conscious menus and
   * mandatory disclosure laws in several countries).
   */
  @Prop()
  calories?: number;

  /**
   * Macros in grams — protein, carbs, fat, fiber.
   * Stored as a sub-document so it is easy to extend.
   */
  @Prop({
    type: {
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
    },
    default: null,
  })
  nutritional_info?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };

  // ── Media ─────────────────────────────────────────────────────
  @Prop({
    type: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: MediaType },
        format: { type: String, enum: MediaFormat },
        is_primary: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        alt_text: String,
      },
    ],
    default: [],
  })
  media: {
    url: string;
    type?: MediaType;
    format?: MediaFormat;
    is_primary?: boolean;
    order?: number;
    alt_text?: string;
  }[];

  // ── Dietary / Allergens ───────────────────────────────────────
  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  allergens: string[];

  // ── Status ────────────────────────────────────────────────────
  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_deleted: boolean;

  // ── Tenant ────────────────────────────────────────────────────
  @Prop({ type: Types.ObjectId, required: true })
  organization_id: Types.ObjectId;

  created_at: Date;
  updated_at: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// ── Indexes ──────────────────────────────────────────────────────
ProductSchema.index({ product_uuid: 1 }, { unique: true });
ProductSchema.index({ organization_id: 1, slug: 1 });
ProductSchema.index({ tags: 1 });
