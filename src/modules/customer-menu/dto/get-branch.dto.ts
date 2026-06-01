import { ApiProperty } from '@nestjs/swagger';
import { CustomerBranchInfoDto } from './get-branch-menu.dto';

export class GetBranchResponseDto {
  @ApiProperty({ type: CustomerBranchInfoDto })
  branch: CustomerBranchInfoDto;
}
