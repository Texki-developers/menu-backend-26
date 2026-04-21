import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerBranchInfoDto, CustomerMediaDto } from './get-branch-menu.dto';

export class ProductVariantDto {
  @ApiProperty()
  variant_uuid: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  is_default: boolean;

  @ApiProperty()
  sort_order: number;

  @ApiProperty()
  is_available: boolean;
}

export class ProductExtraDto {
  @ApiProperty()
  extra_uuid: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  is_default: boolean;

  @ApiProperty()
  sort_order: number;

  @ApiProperty()
  is_available: boolean;
}

export class NutritionalInfoDto {
  @ApiPropertyOptional()
  protein?: number;

  @ApiPropertyOptional()
  carbs?: number;

  @ApiPropertyOptional()
  fat?: number;

  @ApiPropertyOptional()
  fiber?: number;
}

export class ProductDetailDto {
  @ApiProperty({ description: 'menu_item id (use for cart / order)' })
  id: string;

  @ApiProperty()
  product_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ description: 'veg | non_veg | vegan' })
  type: string;

  @ApiPropertyOptional()
  spice_level?: string;

  @ApiProperty()
  is_featured: boolean;

  @ApiProperty()
  is_alcohol: boolean;

  @ApiPropertyOptional()
  calories?: number;

  @ApiPropertyOptional({ type: NutritionalInfoDto })
  nutritional_info?: NutritionalInfoDto;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ type: [String] })
  allergens: string[];

  @ApiProperty()
  base_price: number;

  @ApiProperty()
  selling_price: number;

  @ApiPropertyOptional()
  discount_price?: number;

  @ApiProperty()
  is_available: boolean;

  @ApiPropertyOptional()
  prep_time?: string;

  @ApiPropertyOptional()
  max_quantity?: number;

  @ApiPropertyOptional()
  max_extras?: number;

  @ApiProperty({ type: [CustomerMediaDto] })
  media: CustomerMediaDto[];

  @ApiProperty({ type: [ProductVariantDto] })
  variants: ProductVariantDto[];

  @ApiProperty({ type: [ProductExtraDto] })
  extras: ProductExtraDto[];

  @ApiPropertyOptional()
  special_note?: string;

  @ApiPropertyOptional()
  warning_note?: string;

  @ApiPropertyOptional({ description: 'Average rating (stubbed until reviews ship)' })
  rating?: number | null;

  @ApiProperty({ description: 'Total review count (stubbed until reviews ship)' })
  review_count: number;
}

export class GetProductDetailResponseDto {
  @ApiProperty({ type: CustomerBranchInfoDto })
  branch: CustomerBranchInfoDto;

  @ApiProperty({ type: ProductDetailDto })
  item: ProductDetailDto;
}
