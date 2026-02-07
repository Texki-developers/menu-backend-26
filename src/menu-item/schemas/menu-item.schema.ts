import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class MenuItemVariant {
  @Prop()
  name: string;

  @Prop()
  price: number;
}

@Schema({ timestamps: true })
export class MenuItem extends Document {
  @Prop({ type: String, ref: 'Category', required: true })
  categoryId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: true })
  available: boolean;

  @Prop({ type: [MenuItemVariant], default: [] })
  variants: MenuItemVariant[];
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
