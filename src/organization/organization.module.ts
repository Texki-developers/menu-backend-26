import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Organization, OrganizationSchema } from "./schemas";
import { OrganizationController } from "./organization.controller";
import { OrganizationService } from "./organization.service";
import { BranchModule } from "src/branch/branch.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Organization.name,
                schema: OrganizationSchema
            }
        ]),
        forwardRef(() => BranchModule)
    ],
    controllers: [OrganizationController],
    providers: [OrganizationService],
    exports: [OrganizationService]
})

export class OrganizationModule {

}