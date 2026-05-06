import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from 'joi';
import { UpdateStatusMigration } from "./update-status.migration";
import { Branch, BranchSchema } from "../modules/branches/schema/branches.schema";
import { AddCitySlugMigration } from "./add-city-slug.migration";
import { NormalizeBranchOrganizationIdMigration } from "./normalize-branch-organization-id.migration";

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
    ]),
  ],
  providers: [UpdateStatusMigration, AddCitySlugMigration, NormalizeBranchOrganizationIdMigration],
  exports: [UpdateStatusMigration, AddCitySlugMigration, NormalizeBranchOrganizationIdMigration],
})
export class MigrationsModule {}