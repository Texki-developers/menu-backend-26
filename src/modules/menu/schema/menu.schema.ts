import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { MenuStatus, MenuType } from "../constants/constant";
import { DayOfWeek } from "../../branches/constants/constant";

export interface ScheduleWindow {
    start_time: string; // "HH:mm" 24-hour, branch-local wall clock
    end_time: string;   // "HH:mm"; if end < start, the window wraps past midnight
    days: DayOfWeek[];
}

@Schema({
    collection: 'menus',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Menu extends Document {
    @Prop({ required: true, index: true })
    name: string;

    @Prop({ type: String, enum: MenuType, default: MenuType.BOTH })
    type: MenuType;

    @Prop({ required: false })
    description?: string;

    /**
     * Activation windows. Empty array (or missing) = always active.
     * Each window is interpreted in the branch's local wall-clock time.
     */
    @Prop({
        type: [{
            start_time: { type: String, required: true },
            end_time: { type: String, required: true },
            days: [{ type: String, enum: DayOfWeek }],
        }],
        default: [],
        _id: false,
    })
    schedule: ScheduleWindow[];

    @Prop({ type: String, enum: MenuStatus, default: MenuStatus.ACTIVE })
    status: MenuStatus;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: String, required: true })
    organization_id: string;

    @Prop({ type: String, required: false })
    branch_id?: string;

    created_at: Date;
    updated_at: Date;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);

MenuSchema.virtual('categories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'menuId'
});

MenuSchema.index({ organization_id: 1, branch_id: 1 });
