import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { SortDirection, SortField } from '../constants/constant';

export class CreateSortOptionDto {
  @IsNotEmpty() @IsString() @ApiProperty({ example: 'Price: Low to High' }) label: string;
  @IsEnum(SortField) @ApiProperty({ enum: SortField, example: SortField.PRICE }) field: SortField;
  @IsEnum(SortDirection) @ApiProperty({ enum: SortDirection, example: SortDirection.ASC })
  direction: SortDirection;
  @IsOptional() @IsBoolean() @ApiPropertyOptional({ example: false }) is_default?: boolean;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional({ example: 0 }) sort_order?: number;
  @IsOptional() @IsBoolean() @ApiPropertyOptional({ example: true }) is_active?: boolean;
}
