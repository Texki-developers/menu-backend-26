import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Menu extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, ref: 'Branch', required: true })
  branchId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  validFrom: Date;

  @Prop()
  validTo?: Date;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
