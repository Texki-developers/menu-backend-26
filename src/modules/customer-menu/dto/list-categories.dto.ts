import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerCategoryListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  icon?: string;

  @ApiPropertyOptional()
  image_url?: string;

  @ApiProperty()
  item_count: number;
}

export class ListCategoriesResponseDto {
  @ApiProperty({ type: [CustomerCategoryListItemDto] })
  categories: CustomerCategoryListItemDto[];
}
