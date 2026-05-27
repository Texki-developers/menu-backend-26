import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "../modules/products/schemas/product.schema";

@Injectable()
export class DropProductBranchIdMigration {
    private readonly logger = new Logger(DropProductBranchIdMigration.name);
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
    ) {}

    async run() {
        this.logger.log('Running DropProductBranchIdMigration...');

        const collection = this.productModel.collection;
        const result = await collection.updateMany(
            { branch_id: { $exists: true } },
            { $unset: { branch_id: '' } }
        );

        this.logger.log(`Migration completed. Unset branch_id on ${result.modifiedCount} product documents.`);
    }
}
