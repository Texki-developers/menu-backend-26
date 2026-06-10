import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Branch } from "../modules/branches/schema/branches.schema";

@Injectable()
export class NormalizeBranchOrganizationIdMigration {
    private readonly logger = new Logger(NormalizeBranchOrganizationIdMigration.name);
    constructor(
        @InjectModel(Branch.name) private branchModel: Model<Branch>,
    ) { }

    async run() {
        this.logger.log('Running NormalizeBranchOrganizationIdMigration...');

        const collection = this.branchModel.collection;
        const cursor = collection.find({ organization_id: { $type: 'objectId' } });

        let updatedCount = 0;
        for await (const doc of cursor) {
            await collection.updateOne(
                { _id: doc._id },
                { $set: { organization_id: doc.organization_id.toString() } }
            );
            updatedCount++;
        }

        this.logger.log(`Migration completed. Updated ${updatedCount} branch documents.`);
    }
}
