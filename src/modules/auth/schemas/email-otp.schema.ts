import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  collection: 'email_otps',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class EmailOtp extends Document {
  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  code_hash: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  branch_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  organization_id: Types.ObjectId;

  @Prop({ required: true })
  expires_at: Date;

  @Prop({ default: false })
  consumed: boolean;

  @Prop({ default: 0 })
  attempts: number;

  created_at: Date;
  updated_at: Date;
}

export const EmailOtpSchema = SchemaFactory.createForClass(EmailOtp);
EmailOtpSchema.index({ email: 1, branch_id: 1, created_at: -1 });
EmailOtpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
