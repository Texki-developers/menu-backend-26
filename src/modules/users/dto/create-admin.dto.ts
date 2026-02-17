import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsArray, IsMongoId, IsOptional } from 'class-validator';

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

  @ApiProperty({ example: '60d5ecb5b48777001f7c2231' })
  @IsMongoId()
  @IsNotEmpty()
  organization_id: string;

  @ApiProperty({ example: ['60d5ecb5b48777001f7c2232'], required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  branch_ids?: string[];
}
