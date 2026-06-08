import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'favourites',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Favourite extends Document {
  @Prop({ type: String, required: true })
  customer_id: string;

  @Prop({ type: String, required: true })
  menu_item_id: string;

  @Prop({ type: String, required: true })
  organization_id: string;

  @Prop({ type: String, required: true })
  branch_id: string;

  created_at: Date;
  updated_at: Date;
}

export const FavouriteSchema = SchemaFactory.createForClass(Favourite);

// Idempotent saves: a customer can favourite a given menu_item at most once
FavouriteSchema.index({ customer_id: 1, menu_item_id: 1 }, { unique: true });
FavouriteSchema.index({ customer_id: 1, branch_id: 1, created_at: -1 });
