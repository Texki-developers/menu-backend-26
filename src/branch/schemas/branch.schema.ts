import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { CashProvider, CashProviderSchema, RazorpayProvider, RazorpayProviderSchema } from './payment-provider.schema';

@Schema({ timestamps: true })
export class Branch {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  code: string;

  @Prop({ type: String, ref: 'Organization', required: true })
  organizationId: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ 
    type: { latitude: Number, longitude: Number }, 
    required: true 
  })
  geoLocation: {
    latitude: number;
    longitude: number;
  };

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
    type: {
      dineIn: Boolean,
      takeaway: Boolean,
      delivery: Boolean
    }, 
    default: {
      dineIn: true,
      takeaway: true,
      delivery: true
    },
    required: true
  })
  supports: {
    dineIn: boolean;
    takeaway: boolean;
    delivery: boolean;
  }

  @Prop({ 
    type: {
      cash: { type: CashProviderSchema },
      razorpay: { type: RazorpayProviderSchema }
    },
    default: {
      cash: {
        enabled: true
      }
    }
  })
  paymentProviders: {
    cash?: CashProvider;
    razorpay?: RazorpayProvider;
  }

  @Prop({ default: true })
  isActive: boolean;
}

export type BranchDocument = HydratedDocument<Branch>
export const BranchSchema = SchemaFactory.createForClass(Branch);
