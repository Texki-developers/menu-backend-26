import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ 
  collection: 'admins', 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
})
export class Admin extends Document {
  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: Types.ObjectId, required: true })
  organization_id: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId }], default: [] })
  branch_ids: Types.ObjectId[];

  @Prop()
  last_login_at: Date;

  @Prop({ default: true })
  is_active: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
