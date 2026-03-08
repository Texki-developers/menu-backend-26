import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { USER_ROLES } from '../../../constants/user-roles.constant';

@Schema({ 
  collection: 'admins', 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
})
export class Admin extends Document {
  @ApiProperty({ example: 'Admin Name' })
  @Prop({ required: true })
  full_name: string;

  @ApiProperty({ example: 'admin@example.com' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty({ enum: USER_ROLES, example: USER_ROLES.ORG_ADMIN })
  @Prop({ type: String, enum: Object.values(USER_ROLES), required: true })
  role: string;

  @ApiProperty({ example: '60d5ecb5b48777001f7c2231' })
  @Prop({ type: Types.ObjectId, required: true })
  organization_id: Types.ObjectId;

  @ApiProperty({ example: ['60d5ecb5b48777001f7c2232'], type: [String] })
  @Prop({ type: [{ type: Types.ObjectId }], default: [] })
  branch_ids: Types.ObjectId[];

  @ApiProperty()
  @Prop()
  last_login_at: Date;

  @ApiProperty({ default: true })
  @Prop({ default: true })
  is_active: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
