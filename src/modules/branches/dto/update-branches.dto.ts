import { PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branches.dto';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
