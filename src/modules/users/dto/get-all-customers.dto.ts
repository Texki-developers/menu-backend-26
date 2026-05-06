import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAllCustomersDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Search keyword' })
  query?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '1' })
  page?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '20' })
  limit?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  organization_id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  branch_id?: string;

  @IsOptional()
  @Transform(({ value }) => value === undefined ? value : value === 'true' || value === true)
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  is_verified?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'created_at' })
  sortBy?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'desc' })
  sortOrder?: 'asc' | 'desc';
}
