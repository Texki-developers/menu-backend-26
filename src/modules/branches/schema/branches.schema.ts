import {  Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { BranchStatus } from "../constants/constant";


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

    @Prop({default:BranchStatus.ACTIVE})
    status:BranchStatus;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
