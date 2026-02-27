import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrder } from '../../../common/interfaces/pagination.interface';
import { Transform } from 'class-transformer';

export class GetAllMenuItemsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '1' })
  page?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '20' })
  limit?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  menu_id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  category_id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  organization_id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  branch_id?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  is_available?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiPropertyOptional({ example: false })
  is_featured?: boolean;


  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'sort_order' })
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.ASC })
  sortOrder?: SortOrder;
}
