import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { FilterSource, FilterType } from '../constants/constant';
import { FilterOptionDto, FilterRangeDto } from './filter-option.dto';

export class CreateFilterDto {
  @IsNotEmpty() @IsString() @ApiProperty({ example: 'Dietary' }) name: string;

  @IsEnum(FilterType) @ApiProperty({ enum: FilterType, example: FilterType.MULTI }) type: FilterType;

  @IsEnum(FilterSource) @ApiProperty({ enum: FilterSource, example: FilterSource.TYPE })
  source: FilterSource;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => FilterOptionDto)
  @ApiPropertyOptional({ type: [FilterOptionDto] })
  options?: FilterOptionDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => FilterRangeDto)
  @ApiPropertyOptional({ type: [FilterRangeDto] })
  ranges?: FilterRangeDto[];

  @IsOptional() @IsInt() @Min(0) @ApiPropertyOptional({ example: 0 }) sort_order?: number;
  @IsOptional() @IsBoolean() @ApiPropertyOptional({ example: true }) is_active?: boolean;
}
