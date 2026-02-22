import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { UpdateStatusMigration } from "./update-status.migration";
import { Branch, BranchSchema } from "src/modules/branches/schema/branches.schema";

@Module({
  imports: [
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
  providers: [UpdateStatusMigration],
  exports: [UpdateStatusMigration],
})
export class MigrationsModule {}