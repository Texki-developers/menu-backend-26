import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Branch } from "../modules/branches/schema/branches.schema";

@Injectable()
export class UpdateStatusMigration {
    private readonly logger = new Logger(UpdateStatusMigration.name);
    constructor(
        @InjectModel(Branch.name) private branchModel: Model<Branch>,
    ) {}

    async run() {
        this.logger.log('Running migration...');
        const result = await this.branchModel.updateMany( 
            { status: { $regex: /[A-Z]/ } }, // only uppercase cases
            [
                {
                    $set: {
                        status: { $toLower: "$status" },
                    },
                },
            ]
        )
        this.logger.log(`Migration completed. Updated ${result.modifiedCount} documents.`);
    }
}