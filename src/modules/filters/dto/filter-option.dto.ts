import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FilterOptionDto {
  @IsNotEmpty() @IsString() @ApiProperty({ example: 'Vegetarian' }) label: string;
  @IsNotEmpty() @IsString() @ApiProperty({ example: 'veg' }) value: string;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional({ example: 0 }) sort_order?: number;
}

export class FilterRangeDto {
  @IsNotEmpty() @IsString() @ApiProperty({ example: 'Under 50' }) label: string;
  @IsNumber() @Min(0) @ApiProperty({ example: 0 }) min: number;
  @IsOptional() @IsNumber() @ApiPropertyOptional({ example: 50, nullable: true }) max?: number | null;
  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional({ example: 0 }) sort_order?: number;
}
