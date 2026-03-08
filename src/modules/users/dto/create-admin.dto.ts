import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Admin Name' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '60d5ecb5b48777001f7c2231', description: 'Organization ID (optional, handled by backend)' })
  organization_id?: string;
}

export class CreateOrgAdminDto extends CreateAdminDto {}

export class CreateBranchAdminDto extends CreateAdminDto {
  @ApiProperty({ example: ['60d5ecb5b48777001f7c2232'], description: 'Branch IDs (required for Branch Admin)' })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty({ each: true })
  branch_ids: string[];
}
