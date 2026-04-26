import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class AddressCoordinates {
  @Prop({ type: Number, required: true })
  lat: number;

  @Prop({ type: Number, required: true })
  lng: number;
}

const AddressCoordinatesSchema = SchemaFactory.createForClass(AddressCoordinates);

@Schema({
  _id: true,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Address {
  @Prop({ trim: true })
  label?: string;

  @Prop({ required: true, trim: true })
  line1: string;

  @Prop({ trim: true })
  line2?: string;

  @Prop({ trim: true })
  area?: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ trim: true })
  postal_code?: string;

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ trim: true })
  contact_phone?: string;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ type: AddressCoordinatesSchema, required: false })
  coordinates?: AddressCoordinates;

  @Prop({ default: false })
  is_default: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
