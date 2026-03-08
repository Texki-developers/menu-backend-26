import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { STAFF_ROLES } from '../../../constants/staff-roles.constant';
import type { StaffRole } from '../../../constants/staff-roles.constant';
import { Transform } from 'class-transformer';

export class GetAllStaffDto {
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
  @ApiPropertyOptional({ example: '69948af4435dccf179e3e939', description: 'Organization ID (optional, handled by backend)' })
  organization_id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '69948af4435dccf179e3e939' })
  branch_id?: string;

  @IsOptional()
  @IsEnum(STAFF_ROLES)
  @ApiPropertyOptional({ enum: STAFF_ROLES })
  role?: StaffRole;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  is_active?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'full_name' })
  sortBy?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'asc' })
  sortOrder?: 'asc' | 'desc';
}
