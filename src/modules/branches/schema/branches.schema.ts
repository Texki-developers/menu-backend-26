import {  Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { BranchStatus, BranchType, DayOfWeek } from "../constants/constant";


@Schema({ collection:'branches',timestamps:{
    createdAt:'created_at',
    updatedAt:'updated_at'
}})
export class Branch extends Document {
    @Prop({required:true,index:true})
    name:string;
    
    @Prop({required:true})
    address:string;

    @Prop({required:true,unique:true,index:true})
    phone:string;

    @Prop({ type:Types.ObjectId, ref:'organizations', required:true})
    organization_id:Types.ObjectId;

    @Prop({required:true,unique:true,index:true})
    email:string;

    @Prop({ type: String, enum: BranchType, default: BranchType.STANDARD })
    branch_type: BranchType;

    @Prop({
        type: {
            street: String,
            city: String,
            state: String,
            zip_code: String,
            country: String,
            map_location_url: String,
            coordinates: {
                lat: Number,
                lng: Number
            }
        },
        _id: false
    })
    address_detail: {
        street: string;
        city: string;
        state: string;
        zip_code: string;
        country: string;
        map_location_url?: string;
        coordinates?: { lat: number; lng: number };
    };

    @Prop({ type: Types.ObjectId, ref: 'Staff' })
    manager_id: Types.ObjectId;

    @Prop({
        type: [{
            day: { type: String, enum: DayOfWeek },
            open_time: String,
            close_time: String,
            is_closed: { type: Boolean, default: false }
        }],
        _id: false
    })
    operating_hours: {
        day: DayOfWeek;
        open_time: string;
        close_time: string;
        is_closed: boolean;
    }[];

    @Prop({
        type: {
            capacity: { type: Number, default: 0 },
            current_occupancy: { type: Number, default: 0 }
        },
        _id: false
    })
    occupancy_stats: {
        capacity: number;
        current_occupancy: number;
    };

    @Prop({default:BranchStatus.ACTIVE})
    status:BranchStatus;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
