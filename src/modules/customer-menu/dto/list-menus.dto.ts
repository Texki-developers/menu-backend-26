import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuType } from '../../menu/constants/constant';
import { ScheduleWindow } from '../../menu/schema/menu.schema';

export class CustomerMenuScheduleDto {
  @ApiProperty()
  start_time: string;

  @ApiProperty()
  end_time: string;

  @ApiProperty({ type: [String] })
  days: string[];
}

export class CustomerMenuListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: MenuType })
  type: MenuType;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: [CustomerMenuScheduleDto] })
  schedule: ScheduleWindow[];

  @ApiProperty()
  is_currently_active: boolean;
}

export class ListMenusResponseDto {
  @ApiProperty({ type: [CustomerMenuListItemDto] })
  menus: CustomerMenuListItemDto[];
}
