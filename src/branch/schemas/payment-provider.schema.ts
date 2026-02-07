import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class CashProvider {
  @Prop({ default: true })
  enabled: boolean;
}

@Schema({ _id: false })
export class RazorpayProvider {
  @Prop({ default: false })
  enabled: boolean;

  @Prop()
  keyId: string;

  @Prop()
  keySecret: string;
}

export const CashProviderSchema = SchemaFactory.createForClass(CashProvider);
export const RazorpayProviderSchema = SchemaFactory.createForClass(RazorpayProvider);