import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({ 
  timestamps: true 
})
export class Organization extends Document {
  @Prop({ 
    required: true 
  })
  name: string;

  @Prop({ 
    unique: true, 
    required: true, 
    index: true 
  })
  slug: string;

  @Prop({})
  address: string;

  @Prop({ 
    required: true, 
    enum: ['AED', 'INR'], 
    default: "AED" 
  })
  currency: 'AED' | 'INR';

  @Prop({ 
    required: true, 
    enum: ['Asia/Kolkata' , 'Asia/Dubai'],
    default: 'Asia/Kolkata'
  })
  timezone: 'Asia/Kolkata' | 'Asia/Dubai';

  @Prop({ 
    default: 'active', 
    required: true, 
    enum: ['active', 'pending', 'suspended']
  })
  status: 'active' | 'pending' | 'suspended';
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
