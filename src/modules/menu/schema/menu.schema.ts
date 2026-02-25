import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { MenuStatus, MenuType } from "../constants/constant";

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

    @Prop({ required: false })
    start_time?: string;

    @Prop({ required: false })
    end_time?: string;

    @Prop({ type: String, enum: MenuStatus, default: MenuStatus.ACTIVE })
    status: MenuStatus;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Types.ObjectId, ref: 'organizations', required: true })
    organization_id: Types.ObjectId;

    created_at: Date;
    updated_at: Date;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);

MenuSchema.virtual('categories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'menuId'
});
