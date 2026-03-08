import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMenuItemDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '65d8f7a9e1b2c3d4e5f6a7b8', description: 'Reference to Product._id' })
  product_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '65d8f7a9e1b2c3d4e5f6a7b8', description: 'Reference to Menu._id' })
  menu_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '65d8f7a9e1b2c3d4e5f6a7b8', description: 'Reference to Category._id' })
  category_id: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8', description: 'Organization ID (optional, handled by backend)' })
  organization_id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  branch_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 14.99, description: 'Cost / base price for reference' })
  base_price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 19.99 })
  selling_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 15.99, description: 'Promotional/discount price' })
  discount_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({ example: 5, description: 'Max units a customer can order per transaction' })
  max_quantity?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 1, default: 0, description: 'Display order within category' })
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false, default: false })
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true, default: true })
  is_available?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '15 mins' })
  prep_time?: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [Object], description: 'Optional media override for this menu item' })
  media?: any[];
}
