import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { CategoryIcon } from "../constants/constant";

@Schema({ collection: 'categories', timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
}})
export class Category extends Document {
    @Prop({ required: true, index: true }) 
    name: string;

    @Prop({ type: String, enum: CategoryIcon, default: CategoryIcon.UTENSILS_CROSSED })
    icon: CategoryIcon;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Types.ObjectId, ref: 'menus', required: false })
    menuId: Types.ObjectId;

    @Prop({ type: Number, default: 0 })
    itemCount: number;

    created_at: Date;
    updated_at: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
