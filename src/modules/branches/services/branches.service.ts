import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Branch } from '../schema/branches.schema';
import { Model } from 'mongoose';
import { CreateBranchDto } from '../dto/create-branches.dto';
import { handleDbError } from '../../../common/utils/db-error.utils';
import { GetAllBranchesDto } from '../dto/get-all-branches.dto';

@Injectable()
export class BranchService { 
    constructor(
        @InjectModel(Branch.name) private branchModel: Model<Branch>,
    ){}

    async getAllBranches(getAllBranchesDto:GetAllBranchesDto):Promise<Branch[]>{
        try {
            return await this.branchModel.find().exec();
        } catch (error) {
            handleDbError(error, 'getting the branches');
            throw error; // This line is technically unreachable as handleDbError throws
        }
    }

    async createBranch(branchData: CreateBranchDto): Promise<Branch> {
        try {
            const branch = new this.branchModel(branchData);
            return await branch.save();
        } catch (error) {
            handleDbError(error, 'creating the branch');
            throw error; // This line is technically unreachable as handleDbError throws
        }
    }
}
