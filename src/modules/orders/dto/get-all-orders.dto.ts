import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrder } from '../../../common/interfaces/pagination.interface';
import { OrderStatus } from '../schemas/order.schema';

export class GetAllOrdersDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '1' })
  page?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '20' })
  limit?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.PENDING })
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'John' })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'created_at' })
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.DESC })
  sortOrder?: SortOrder;
}
