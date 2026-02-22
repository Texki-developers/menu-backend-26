import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Branch } from "../modules/branches/schema/branches.schema";
import { CityToSlugMap } from "../modules/branches/constants/constant";

@Injectable()
export class AddCitySlugMigration {
    private readonly logger = new Logger(AddCitySlugMigration.name);
    constructor(
        @InjectModel(Branch.name) private branchModel: Model<Branch>,
    ) {}

    async run() {
        this.logger.log('Running AddCitySlugMigration...');
        
        const branches = await this.branchModel.find({ 
            "address_detail.city": { $exists: true }
        });

        this.logger.log(`Found ${branches.length} branches to check.`);

        let updatedCount = 0;
        for (const branch of branches) {
            if (branch.address_detail?.city) {
                const citySlug = CityToSlugMap[branch.address_detail.city];
                if (branch.address_detail.citySlug !== citySlug) {
                    await this.branchModel.updateOne(
                        { _id: branch._id },
                        { $set: { "address_detail.citySlug": citySlug } }
                    );
                    updatedCount++;
                }
            }
        }

        this.logger.log(`Migration completed. Updated ${updatedCount} documents.`);
    }
}
