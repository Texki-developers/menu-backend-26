import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaFormat, MediaType, ProductType, SpiceLevel } from '../constants/constant';

class NutritionalInfoDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 25, description: 'Protein in grams' })
  protein?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 40, description: 'Carbohydrates in grams' })
  carbs?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 15, description: 'Fat in grams' })
  fat?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 5, description: 'Fiber in grams' })
  fiber?: number;
}

class ProductMediaDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'https://cdn.example.com/product.jpg' })
  url: string;

  @IsOptional()
  @IsEnum(MediaType)
  @ApiPropertyOptional({ enum: MediaType })
  type?: MediaType;

  @IsOptional()
  @IsEnum(MediaFormat)
  @ApiPropertyOptional({ enum: MediaFormat })
  format?: MediaFormat;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  is_primary?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 1 })
  order?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Grilled Chicken Burger' })
  alt_text?: string;
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Grilled Chicken Burger' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'grilled-chicken-burger' })
  slug: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Juicy grilled chicken in a brioche bun' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'SKU-0001' })
  sku?: string;

  @IsNotEmpty()
  @IsEnum(ProductType)
  @ApiProperty({ enum: ProductType, example: ProductType.NON_VEG })
  type: ProductType;

  @IsOptional()
  @IsEnum(SpiceLevel)
  @ApiPropertyOptional({ enum: SpiceLevel, default: SpiceLevel.NONE })
  spice_level?: SpiceLevel;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false, default: false })
  is_alcohol?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false, default: false })
  is_featured?: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 14.99 })
  base_price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 5, description: 'Tax rate as a percentage (e.g. 5 = 5%)' })
  base_tax_rate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 520, description: 'Calories in kcal' })
  calories?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => NutritionalInfoDto)
  @ApiPropertyOptional({ type: NutritionalInfoDto })
  nutritional_info?: NutritionalInfoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  @ApiPropertyOptional({ type: [ProductMediaDto] })
  media?: ProductMediaDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ example: ['spicy', 'bestseller'], type: [String] })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ example: ['gluten', 'dairy'], type: [String] })
  allergens?: string[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true, default: true })
  is_active?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8', description: 'Organization ID (optional, handled by backend)' })
  organization_id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8', description: 'Branch ID (optional, can be provided by admin)' })
  branch_id?: string;
}
