import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SearchItemsQueryDto {
  @ApiProperty({ description: 'Menu to search within' })
  @IsNotEmpty()
  @IsString()
  menuId: string;

  @ApiPropertyOptional({ description: 'Free-text search on name / description' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Comma-separated dish types, e.g. veg,vegan' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Comma-separated spice levels' })
  @IsOptional()
  @IsString()
  spice_level?: string;

  @ApiPropertyOptional({ description: 'Comma-separated tags' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Minimum effective price' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsNumber()
  price_min?: number;

  @ApiPropertyOptional({ description: 'Maximum effective price' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsNumber()
  price_max?: number;

  @ApiPropertyOptional({ description: 'Only featured items' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ enum: ['price', 'name', 'featured', 'created_at'] })
  @IsOptional()
  @IsIn(['price', 'name', 'featured', 'created_at'])
  sort_by?: 'price' | 'name' | 'featured' | 'created_at';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';
}
