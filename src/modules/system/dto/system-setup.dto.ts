import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SystemSetupDto {
  @ApiProperty({ example: 'My Restaurant' })
  @IsString()
  @IsNotEmpty()
  org_name: string;

  @ApiProperty({ example: 'my-restaurant' })
  @IsString()
  @IsNotEmpty()
  org_slug: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  org_address: string;

  @ApiProperty({ example: 'Asia/Dubai' })
  @IsString()
  @IsNotEmpty()
  org_timezone: string;

  @ApiProperty({ example: 'Admin User' })
  @IsString()
  @IsNotEmpty()
  admin_name: string;

  @ApiProperty({ example: 'admin@myrest.com' })
  @IsEmail()
  admin_email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  admin_phone: string;

  @ApiProperty({ example: 'supersecretpassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  admin_password: string;

  @ApiProperty({ description: 'The system access key from .env' })
  @IsString()
  @IsNotEmpty()
  system_key: string;
}
