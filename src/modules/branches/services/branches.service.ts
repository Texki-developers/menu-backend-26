import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Branch } from '../schema/branches.schema';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { CreateBranchDto } from '../dto/create-branches.dto';
import { UpdateBranchDto } from '../dto/update-branches.dto';
import { handleDbError, escapeRegex } from '../../../common/utils';
import { GetAllBranchesDto, SortOrder } from '../dto/get-all-branches.dto';
import { CityToSlugMap } from '../constants/constant';

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

            // 1. Build Filter Objects
            const baseFilter: Record<string, any> = {};
            if (organization_id) {
                baseFilter.organization_id = new mongoose.Types.ObjectId(organization_id);
            }

            const searchFilter: Record<string, any> = {};
            if (status) {
                searchFilter.status = status;
            }

            if (query) {
                const safeQuery = escapeRegex(query);
                searchFilter.$or = [
                    { name: { $regex: safeQuery, $options: 'i' } },
                    { email: { $regex: safeQuery, $options: 'i' } },
                    { phone: { $regex: safeQuery, $options: 'i' } }
                ];
            }

            // 2. Execute Aggregation (Single DB Round-trip)
            const [result] = await this.branchModel.aggregate([
                { $match: baseFilter },
                {
                    $facet: {
                        data: [
                            { $match: searchFilter },
                            { $sort: { [sortBy]: sortOrder === SortOrder.DESC ? -1 : 1 } },
                            { $skip: skip },
                            { $limit: limitNum }
                        ],
                        total: [
                            { $match: searchFilter },
                            { $count: 'count' }
                        ],
                        totalWithoutFilter: [
                            { $count: 'count' }
                        ],
                        totalActive: [
                            { $match: { status: 'active' } },
                            { $count: 'count' }
                        ]
                    }
                },
                {
                    $project: {
                        data: 1,
                        total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
                        totalActive: { $ifNull: [{ $arrayElemAt: ['$totalActive.count', 0] }, 0] },
                        totalWithoutFilter: { $ifNull: [{ $arrayElemAt: ['$totalWithoutFilter.count', 0] }, 0] }
                    }
                }
            ]);

            // 3. Return Standard paginated response
            return {
                data: result.data,
                meta: {
                    total: result.total,
                    totalPages: Math.ceil(result.total / limitNum),
                    totalActive: result.totalActive,
                    totalWithoutFilter: result.totalWithoutFilter,
                    page: pageNum,
                    limit: limitNum,
                }
            };

        } catch (error) {
            handleDbError(error, 'getting the branches');
            throw error;
        }
    }

    async createBranch(branchData: CreateBranchDto): Promise<Branch> {
        try {
            if (branchData.address_detail?.city) {
                branchData.address_detail.citySlug = CityToSlugMap[branchData.address_detail.city];
            }
            const branch = new this.branchModel(branchData);
            return await branch.save();
        } catch (error) {
            handleDbError(error, 'creating the branch');
            throw error; // This line is technically unreachable as handleDbError throws
        }
    }

    async updateBranch(id: string, updateData: UpdateBranchDto): Promise<Branch> {
        try {
            if (updateData.address_detail?.city) {
                updateData.address_detail.citySlug = CityToSlugMap[updateData.address_detail.city];
            }
            const updatedBranch = await this.branchModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedBranch) {
                throw new NotFoundException('Branch not found');
            }

            return updatedBranch;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'updating the branch');
            throw error;
        }
    }

    async deleteBranch(id: string) {
        try {
            const result = await this.branchModel.findByIdAndDelete(id);
            if (!result) {
                throw new NotFoundException('Branch not found');
            }
            return result;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'deleting the branch');
            throw error;
        }
    }
}
