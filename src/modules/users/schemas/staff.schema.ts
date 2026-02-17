import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { STAFF_ROLES } from '../../../constants/staff-roles.constant';
import type { StaffRole } from '../../../constants/staff-roles.constant';

@Schema({ 
  collection: 'staffs', 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
})
export class Staff extends Document {
  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, unique: true })
  employee_code: string;

  @Prop({ type: String, enum: Object.values(STAFF_ROLES), required: true })
  role: StaffRole;

  @Prop({ type: Types.ObjectId, required: true })
  organization_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  branch_id: Types.ObjectId;

  @Prop({
    type: {
      can_create_order: { type: Boolean, default: false },
      can_update_order: { type: Boolean, default: false },
      can_cancel_payment: { type: Boolean, default: false },
      can_handle_payment: { type: Boolean, default: false },
    },
    _id: false,
    default: {
      can_create_order: false,
      can_update_order: false,
      can_cancel_payment: false,
      can_handle_payment: false,
    },
  })
  permissions: {
    can_create_order: boolean;
    can_update_order: boolean;
    can_cancel_payment: boolean;
    can_handle_payment: boolean;
  };

  @Prop({
    type: {
      is_on_duty: { type: Boolean, default: false },
      shift_starts: { type: Date },
      shift_end: { type: Date },
    },
    _id: false,
    default: {
      is_on_duty: false
    },
  })
  work_status: {
    is_on_duty: boolean;
    shift_starts?: Date;
    shift_end?: Date;
  };

  @Prop({ default: true })
  is_active: boolean;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
