import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductType } from '../constants/constant';
import { SortOrder } from '../../../common/interfaces/pagination.interface';

export class GetAllProductsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'burger', description: 'Search by name, slug, or description' })
  query?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '1' })
  page?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '10' })
  limit?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  organization_id?: string;

  @IsOptional()
  @IsEnum(ProductType)
  @ApiPropertyOptional({ enum: ProductType, example: ProductType.VEG })
  type?: ProductType;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false })
  is_featured?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'created_at' })
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.DESC })
  sortOrder?: SortOrder;
}
