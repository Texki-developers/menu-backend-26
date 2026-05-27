import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from 'joi';
import { UpdateStatusMigration } from "./update-status.migration";
import { Branch, BranchSchema } from "../modules/branches/schema/branches.schema";
import { Product, ProductSchema } from "../modules/products/schemas/product.schema";
import { AddCitySlugMigration } from "./add-city-slug.migration";
import { NormalizeBranchOrganizationIdMigration } from "./normalize-branch-organization-id.migration";
import { DropProductBranchIdMigration } from "./drop-product-branch-id.migration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>("MONGO_URI"),
      }),
    }),
    MongooseModule.forFeature([
      { name: Branch.name, schema: BranchSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [
    UpdateStatusMigration,
    AddCitySlugMigration,
    NormalizeBranchOrganizationIdMigration,
    DropProductBranchIdMigration,
  ],
  exports: [
    UpdateStatusMigration,
    AddCitySlugMigration,
    NormalizeBranchOrganizationIdMigration,
    DropProductBranchIdMigration,
  ],
})
export class MigrationsModule {}
