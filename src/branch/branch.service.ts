import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Branch } from './schemas';
import { Model } from 'mongoose';
import { CreateBranchDTO, UpdateBranchDTO } from './dto/branch.dto';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class BranchService {
    constructor(
        @InjectModel(Branch.name) private branchModel: Model<Branch>,
        @Inject(forwardRef(() => OrganizationService)) private readonly organizationService: OrganizationService
    ) {}

    async create(createBranchDTO: CreateBranchDTO): Promise<Branch> {
        const organization = await this.organizationService.findBySlug(createBranchDTO.organizationSlug);
        if (!organization) {
            throw new NotFoundException(`Organization with slug ${createBranchDTO.organizationSlug} not found`);
        }

        const { organizationSlug, ...rest } = createBranchDTO;

        return this.branchModel.create({
            ...rest,
            organizationId: organization._id.toString()
        });
    }

    async findAll(): Promise<Branch[]> {
        return this.branchModel.find().exec();
    }

    async findOne(id: string): Promise<Branch | null> {
        return this.branchModel.findById(id).exec();
    }

    async update(id: string, updateBranchDTO: UpdateBranchDTO): Promise<Branch | null> {
        return this.branchModel.findByIdAndUpdate(id, updateBranchDTO, { new: true }).exec();
    }

    async remove(id: string): Promise<Branch | null> {
        return this.branchModel.findByIdAndDelete(id).exec();
    }

    isBranchCodeExist(branchCode: string) {
        return this.branchModel.exists({ code: branchCode });
    }

    async removeByOrganizationId(organizationId: string): Promise<void> {
        await this.branchModel.deleteMany({ organizationId }).exec();
    }
}
