import { Injectable, Inject, forwardRef, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Organization } from "./schemas";
import { CreateOrganizationDTO, UpdateOrganizationDTO } from "./dto";
import { slugify } from "src/common/utils";
import { BranchService } from "src/branch/branch.service";

@Injectable({})

export class OrganizationService {
    constructor(
        @InjectModel(Organization.name) private organizationModel: Model<Organization>,
        @Inject(forwardRef(() => BranchService)) private readonly branchService: BranchService
    ){}

    create(organizationData: CreateOrganizationDTO){
        return this.organizationModel.create(organizationData)
    }

    findAll(){
        return this.organizationModel.find({})
    }

    async findOne(id: string) {
        return this.organizationModel.findById(id).exec();
    }

    async update(id: string, updateOrganizationDTO: UpdateOrganizationDTO) {
        return this.organizationModel.findByIdAndUpdate(id, updateOrganizationDTO, { new: true }).exec();
    }

    async remove(id: string) {
        const organization = await this.organizationModel.findByIdAndDelete(id).exec();
        if (organization) {
            await this.branchService.removeByOrganizationId(id);
        }
        return organization;
    }

    async findBySlug(slug: string) {
        return this.organizationModel.findOne({ slug }).exec();
    }

    async generateUniqueSlug(name: string): Promise<string> {
        const slug = slugify(name);
      
        // 1️⃣ Find existing slugs in ONE query
        const existingSlugs = await this.organizationModel
          .find({ slug: new RegExp(`^${slug}(-\\d+)?$`) })
          .select('slug -_id')
          .lean();
      
        if (existingSlugs.length === 0) {
          return slug;
        }
      
        // 2️⃣ Extract numbers
        const numbers = existingSlugs
          .map(o => {
            const match = o.slug.match(/-(\d+)$/);
            return match ? Number(match[1]) : 1;
          });
      
        // 3️⃣ Find next available
        const next = Math.max(...numbers) + 1;
      
        return `${slug}-${next}`;
      }
      
}