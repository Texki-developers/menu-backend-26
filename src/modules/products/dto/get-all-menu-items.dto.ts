import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { SortOrder } from '../../../common/interfaces/pagination.interface';
import { IsEnum } from 'class-validator';

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
  @IsMongoId()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  menu_id?: string;

  @IsOptional()
  @IsMongoId()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  category_id?: string;

  @IsOptional()
  @IsMongoId()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  organization_id?: string;

  @IsOptional()
  @IsMongoId()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  branch_id?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  is_available?: boolean;

  @IsOptional()
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
