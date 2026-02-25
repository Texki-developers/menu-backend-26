import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'menu_items',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class MenuItem extends Document {
  // ── Identity ─────────────────────────────────────────────────
  @Prop({ required: true, unique: true })
  menu_item_uuid: string;

  // ── References ────────────────────────────────────────────────
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true })
  menu_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  organization_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  branch_id: Types.ObjectId;

  // ── Pricing ───────────────────────────────────────────────────
  /** Base (cost) price carried over from Product for reference. */
  @Prop({ required: true })
  base_price: number;

  /** The actual price charged to the customer. */
  @Prop({ required: true })
  selling_price: number;

  /**
   * Optional promotional / happy-hour price.
   * When set, the frontend should display this instead of selling_price.
   */
  @Prop()
  discount_price?: number;

  // ── Ordering Rules ────────────────────────────────────────────
  /**
   * Maximum units a customer can order per transaction.
   * Null means no limit.
   */
  @Prop({ default: null })
  max_quantity?: number;

  // ── Display ───────────────────────────────────────────────────
  /** Controls the display position within its category on the menu. */
  @Prop({ default: 0 })
  sort_order: number;

  /** Flags this item as featured / chef's special in the menu view. */
  @Prop({ default: false })
  is_featured: boolean;

  // ── Availability ──────────────────────────────────────────────
  @Prop({ default: true })
  is_available: boolean;

  /** Estimated preparation time, e.g. "15 mins". */
  @Prop()
  prep_time?: string;

  // ── Media override ────────────────────────────────────────────
  /**
   * Optional per-menu-item media that overrides the Product's media.
   * Useful when the same product is presented differently across menus.
   */
  @Prop({ type: Array, default: [] })
  media?: any[];

  created_at: Date;
  updated_at: Date;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

// ── Indexes ──────────────────────────────────────────────────────
MenuItemSchema.index({ menu_item_uuid: 1 }, { unique: true });
MenuItemSchema.index({ menu_id: 1, category_id: 1 });
MenuItemSchema.index({ organization_id: 1, branch_id: 1 });
MenuItemSchema.index({ product_id: 1 });
MenuItemSchema.index({ is_available: 1, menu_id: 1 });
