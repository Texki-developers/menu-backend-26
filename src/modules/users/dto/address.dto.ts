import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class AddressCoordinatesDto {
  @ApiProperty({ example: 25.2048 })
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 55.2708 })
  @IsLongitude()
  lng: number;
}

export class CreateAddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  label?: string;

  @ApiProperty({ example: 'Building 12, Apt 503' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  line1: string;

  @ApiPropertyOptional({ example: 'Near Marina Mall' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line2?: string;

  @ApiPropertyOptional({ example: 'Dubai Marina' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  area?: string;

  @ApiProperty({ example: 'Dubai' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city: string;

  @ApiPropertyOptional({ example: 'Dubai' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  state?: string;

  @ApiPropertyOptional({ example: '00000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postal_code?: string;

  @ApiProperty({ example: 'AE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  country: string;

  @ApiPropertyOptional({ example: '+971501234567' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  contact_phone?: string;

  @ApiPropertyOptional({ example: 'Leave at the door' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;

  @ApiPropertyOptional({ type: AddressCoordinatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressCoordinatesDto)
  coordinates?: AddressCoordinatesDto;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
