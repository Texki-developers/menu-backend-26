import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
  collection: 'organizations', 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
})
export class Organization extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: String, enum: ['AED', 'INR'], default: 'AED' })
  currency: string;

  @Prop({ required: true })
  timezone: string;

  @Prop({ default: 'active' })
  status: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
