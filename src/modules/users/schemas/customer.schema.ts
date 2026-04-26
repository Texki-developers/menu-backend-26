import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LOGIN_METHODS } from '../../../constants/login-methods.constant';
import type { LoginMethod } from '../../../constants/login-methods.constant';
import { Address, AddressSchema } from './address.schema';

@Schema({
  collection: 'customers',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Customer extends Document {
  @Prop({ required: true })
  full_name: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({ default: false })
  is_verified: boolean;

  @Prop({ type: String, enum: Object.values(LOGIN_METHODS), default: LOGIN_METHODS.PASSWORD })
  login_method: LoginMethod;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: (Address & { _id: Types.ObjectId })[];

  @Prop({ type: Types.ObjectId, required: true })
  organization_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  branch_id: Types.ObjectId;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
