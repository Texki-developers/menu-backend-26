import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerBranchInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  organization_id: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional({ type: Object })
  address_detail?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [Object] })
  operating_hours?: Record<string, unknown>[];

  @ApiProperty()
  status: string;
}

export class CustomerMediaDto {
  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  format?: string;

  @ApiPropertyOptional()
  is_primary?: boolean;

  @ApiPropertyOptional()
  order?: number;

  @ApiPropertyOptional()
  alt_text?: string;
}

export class CustomerMenuItemDto {
  @ApiProperty({ description: 'menu_item id (use this for cart / order)' })
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

  @ApiPropertyOptional()
  calories?: number;

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

  @ApiProperty({ type: [CustomerMediaDto] })
  media: CustomerMediaDto[];
}

export class CustomerCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  icon?: string;

  @ApiPropertyOptional()
  image_url?: string;

  @ApiProperty({ type: [CustomerMenuItemDto] })
  items: CustomerMenuItemDto[];
}

export class GetBranchMenuResponseDto {
  @ApiProperty({ type: CustomerBranchInfoDto })
  branch: CustomerBranchInfoDto;

  @ApiProperty({ type: [CustomerCategoryDto] })
  categories: CustomerCategoryDto[];
}
