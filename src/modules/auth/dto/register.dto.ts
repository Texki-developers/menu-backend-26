import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsMongoId } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: 'john@example.com' })
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

  @ApiProperty({ example: '60d5ecb5b48777001f7c2232' })
  @IsMongoId()
  @IsNotEmpty()
  branch_id: string;
}
