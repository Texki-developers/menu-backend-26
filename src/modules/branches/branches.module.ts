import { Module } from '@nestjs/common';
import { BranchService } from './services/branches.service';
import { BranchesController } from './controller/branches.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from './schema/branches.schema';
@Module({
  imports:[
    MongooseModule.forFeature([{
      name: Branch.name,
      schema: BranchSchema
    }])
  ],
  controllers: [BranchesController],
  providers: [BranchService]
})
export class BranchesModule {}
