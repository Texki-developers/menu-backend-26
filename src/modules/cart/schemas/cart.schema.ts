import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CartStatus } from '../constants/constant';

@Schema({ _id: false })
export class CartItem {
  /** Stable UUID supplied by the client — idempotency key for add/update. */
  @Prop({ required: true })
  cart_item_id: string;

  @Prop({ type: String, ref: 'MenuItem', required: true })
  menu_item_id: string;

  /** Selected variant (size). Required when the menu item has variants. */
  @Prop({ type: String })
  variant_uuid?: string;

  /** Selected extras (modifiers). Always an array — empty when none picked. */
  @Prop({ type: [String], default: [] })
  extra_uuids: string[];

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ type: String })
  note?: string;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({
  collection: 'carts',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Cart extends Document {
  /** Anonymous identifier — always set. Survives logout/login. */
  @Prop({ required: true, index: true })
  cart_token: string;

  /** Set once the user authenticates via OTP. */
  @Prop({ type: String, index: true })
  user_id?: string;

  @Prop({ type: String, required: true, index: true })
  branch_id: string;

  @Prop({ type: String, required: true, index: true })
  organization_id: string;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @Prop({ type: String, enum: CartStatus, default: CartStatus.ACTIVE, index: true })
  status: CartStatus;

  /** TTL — Mongo auto-deletes when expires_at passes. Renewed on every write. */
  @Prop({ type: Date, required: true })
  expires_at: Date;

  created_at: Date;
  updated_at: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index({ cart_token: 1, branch_id: 1, status: 1 });
CartSchema.index({ user_id: 1, branch_id: 1, status: 1 });
CartSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
