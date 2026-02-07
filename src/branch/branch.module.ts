import { Module, forwardRef } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from './schemas';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Branch.name,
        schema: BranchSchema
      }
    ]),
    forwardRef(() => OrganizationModule)
  ],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService]
})
export class BranchModule {}
