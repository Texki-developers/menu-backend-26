import { Injectable, NotFoundException } from '@nestjs/common';
import * as express from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Branch } from '../schema/branches.schema';
import { Model } from 'mongoose';
import { CreateBranchDto } from '../dto/create-branches.dto';
import { UpdateBranchDto } from '../dto/update-branches.dto';
import { handleDbError, escapeRegex, paginate } from '../../../common/utils';
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

            // 1. Build Filter Objects
            const baseFilter: Record<string, any> = {};
            if (organization_id) {
                baseFilter.organization_id = organization_id;
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

            // 2. Execute Paginated Search
            return await paginate(this.branchModel, {
                page,
                limit,
                sortBy,
                sortOrder: sortOrder as any,
                baseFilter,
                searchFilter,
                extraFacets: {
                    totalActive: [
                        { $match: { status: 'active' } },
                        { $count: 'count' }
                    ]
                }
            });
        } catch (error) {
            handleDbError(error, 'getting the branches');
            throw error;
        }
    }

    async downloadBranchesCsv(res: any, organizationId?: string) {
        try {
            const filter = organizationId ? { organization_id: organizationId } : {};
            const branches = await this.branchModel.find(filter).lean();
            
            const headers = ['Name', 'Email', 'Phone', 'Branch Type', 'City', 'Street', 'Status', 'Created At'];
            const rows = branches.map(branch => {
                console.log("🚀 ~ BranchService ~ downloadBranchesCsv ~ branch:", branch)
                return [
                    branch.name,
                    branch.email || '',
                    branch.phone || '',
                    branch.branch_type || '',
                    branch.address_detail?.city || '',
                    branch.address_detail?.street || '',
                    branch.status || '',
                    branch.created_at ? new Date(branch.created_at).toLocaleString() : branch.created_at ? new Date(branch.created_at).toLocaleString() : ''
                ];
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=branches.csv');
            return res.status(200).send(csvContent);
        } catch (error) {
            handleDbError(error, 'downloading branches csv');
            throw error;
        }
    }

    async getBranchById(id: string): Promise<Branch> {
        try {
            const branch = await this.branchModel.findById(id);
            if (!branch) {
                throw new NotFoundException('Branch not found');
            }
            return branch;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            handleDbError(error, 'getting the branch by id');
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
