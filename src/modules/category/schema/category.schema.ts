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

    /** Optional image shown on the customer-facing category strip. Falls back to icon when absent. */
    @Prop({ type: String, required: false })
    image_url?: string;

    /** Cloudinary public_id for image_url; used to delete the asset when the image is replaced or the category removed. */
    @Prop({ type: String, required: false })
    image_public_id?: string;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: String, required: true })
    organization_id: string;

    @Prop({ type: String, required: false })
    branch_id: string;

    @Prop({ type: String, required: false })
    menuId: string;

    created_at: Date;
    updated_at: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ organization_id: 1, branch_id: 1 });
CategorySchema.index({ menuId: 1 });
