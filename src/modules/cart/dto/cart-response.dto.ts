import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartItemMediaDto {
  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  alt_text?: string;
}

export class CartItemLineDto {
  @ApiProperty()
  cart_item_id: string;

  @ApiProperty()
  menu_item_id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiPropertyOptional({ type: CartItemMediaDto })
  image?: CartItemMediaDto;

  @ApiPropertyOptional()
  variant_uuid?: string;

  @ApiPropertyOptional()
  variant_label?: string;

  @ApiProperty({ type: [Object] })
  extras: { extra_uuid: string; label: string; price: number }[];

  @ApiProperty({ description: 'Unit price = variant_price (or base selling_price) + sum(extra prices)' })
  unit_price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ description: 'unit_price × quantity' })
  line_total: number;

  @ApiPropertyOptional()
  note?: string;

  @ApiProperty({
    description: 'true when the item is still orderable at the current branch with the selected variant/extras',
  })
  is_available: boolean;

  @ApiPropertyOptional({ description: 'Populated when is_available is false' })
  unavailable_reason?: string;
}

export class CartTotalsDto {
  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  item_count: number;

  @ApiProperty({ description: 'Sum of quantities across lines' })
  total_quantity: number;
}

export class CartResponseDto {
  @ApiProperty()
  cart_token: string;

  @ApiPropertyOptional()
  user_id?: string;

  @ApiProperty()
  branch_id: string;

  @ApiProperty()
  organization_id: string;

  @ApiProperty({ type: [CartItemLineDto] })
  items: CartItemLineDto[];

  @ApiProperty({ type: CartTotalsDto })
  totals: CartTotalsDto;

  @ApiProperty()
  status: string;

  @ApiProperty()
  expires_at: Date;
}
