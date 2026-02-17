import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsMongoId, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { STAFF_ROLES } from '../../../constants/staff-roles.constant';
import type { StaffRole } from '../../../constants/staff-roles.constant';

class PermissionsDto {
  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  can_create_order?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  can_update_order?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  can_cancel_payment?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  can_handle_payment?: boolean;
}

export class CreateStaffDto {
  @ApiProperty({ example: 'Staff Name' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  employee_code: string;

  @ApiProperty({ enum: STAFF_ROLES })
  @IsEnum(STAFF_ROLES)
  role: StaffRole;

  @ApiProperty({ example: '60d5ecb5b48777001f7c2231' })
  @IsMongoId()
  @IsNotEmpty()
  organization_id: string;

  @ApiProperty({ example: '60d5ecb5b48777001f7c2232' })
  @IsMongoId()
  @IsNotEmpty()
  branch_id: string;

  @ApiProperty({ type: PermissionsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions?: PermissionsDto;
}
