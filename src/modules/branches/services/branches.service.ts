import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Branch } from '../schema/branches.schema';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { CreateBranchDto } from '../dto/create-branches.dto';
import { handleDbError, escapeRegex } from '../../../common/utils';
import { GetAllBranchesDto, SortOrder } from '../dto/get-all-branches.dto';

@Injectable()
export class BranchService { 
    constructor(
        @InjectModel(Branch.name) private branchModel: Model<Branch>,
    ){}

    async getAllBranches(getAllBranchesDto: GetAllBranchesDto) {
        try {
            const { 
                query, 
                page = '1', 
                limit = '10', 
                organization_id, 
                status, 
                sortBy = 'created_at', 
                sortOrder = SortOrder.DESC 
            } = getAllBranchesDto;

            const pageNum = Number(page);
            const limitNum = Number(limit);
            const skip = (pageNum - 1) * limitNum;

            // 1. Build Filter Object (Type-safe using Record)
            const filter: Record<string, any> = {};

            if (organization_id) {
                filter.organization_id = new mongoose.Types.ObjectId(organization_id);
            }

            if (status) {
                filter.status = status;
            }

            if (query) {
                const safeQuery = escapeRegex(query);
                filter.$or = [
                    { name: { $regex: safeQuery, $options: 'i' } },
                    { email: { $regex: safeQuery, $options: 'i' } },
                    { phone: { $regex: safeQuery, $options: 'i' } }
                ];
            }

            // 2. Execute Aggregation (Single DB Round-trip)
            const [result] = await this.branchModel.aggregate([
                { $match: filter },
                {
                    $facet: {
                        data: [
                            { $sort: { [sortBy]: sortOrder === SortOrder.DESC ? -1 : 1 } },
                            { $skip: skip },
                            { $limit: limitNum }
                        ],
                        total: [
                            { $count: 'count' }
                        ]
                    }
                },
                {
                    $project: {
                        data: 1,
                        total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] }
                    }
                }
            ]);

            // 3. Return Standard paginated response
            return {
                data: result.data,
                meta: {
                    total: result.total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(result.total / limitNum)
                }
            };

        } catch (error) {
            handleDbError(error, 'getting the branches');
            throw error;
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
