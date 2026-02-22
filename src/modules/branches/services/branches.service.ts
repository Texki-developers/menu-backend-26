import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Branch } from '../schema/branches.schema';
import { Model } from 'mongoose';
import { CreateBranchDto } from '../dto/create-branches.dto';

@Injectable()
export class BranchService { 
    constructor(
        @InjectModel(Branch.name) private branchModel: Model<Branch>,
    ){}

    async createBranch(branchData: CreateBranchDto): Promise<Branch> {
        const branch = new this.branchModel(branchData);
        return branch.save();
    }
}
