import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { City } from '../../branches/constants/constant';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'My Restaurant', description: 'Name of the organization' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'my-restaurant', description: 'Unique slug for the organization' })
  slug: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '123 Main St, Dubai', description: 'Physical address of the organization' })
  address: string;

  @IsNotEmpty()
  @IsEnum(City)
  @ApiProperty({ example: City.DUBAI, enum: City, description: 'City of the organization' })
  city: City;

  @IsOptional()
  @IsEnum(['AED', 'INR'])
  @ApiPropertyOptional({ example: 'AED', enum: ['AED', 'INR'], default: 'AED' })
  currency?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Asia/Dubai', description: 'Timezone for the organization' })
  timezone: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'active', description: 'Status of the organization' })
  status?: string;
}
