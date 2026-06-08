import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { OrderType } from '../schemas/order.schema';

export class PublicCheckoutDto {
  @ApiProperty({ enum: OrderType, example: OrderType.DINE_IN })
  @IsEnum(OrderType)
  order_type: OrderType;

  @ApiPropertyOptional({ example: '12', description: 'Required for dine-in' })
  @ValidateIf((o) => o.order_type === OrderType.DINE_IN)
  @IsNotEmpty({ message: 'table_number is required for dine-in orders' })
  @IsString()
  table_number?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsString()
  customer_phone?: string;

  @ApiPropertyOptional({ example: 'No onions please' })
  @IsOptional()
  @IsString()
  notes?: string;
}
