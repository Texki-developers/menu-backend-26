import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../schemas/order.schema';

export class OrderItemDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  menu_item_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Classic Burger' })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 2 })
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 15.0 })
  unit_price: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
  branch_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'John Doe' })
  customer_name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '+971501234567' })
  customer_phone?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Table 5' })
  table_number?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'No onions, please.' })
  notes?: string;
}
