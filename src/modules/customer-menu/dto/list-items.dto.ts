import { ApiProperty } from '@nestjs/swagger';
import { CustomerMenuItemDto } from './get-branch-menu.dto';

export class ListItemsResponseDto {
  @ApiProperty({ type: [CustomerMenuItemDto] })
  items: CustomerMenuItemDto[];
}
