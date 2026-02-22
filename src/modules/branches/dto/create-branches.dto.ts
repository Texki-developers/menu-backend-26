import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, ValidateNested, IsBoolean, IsArray } from "class-validator";
import { Type } from "class-transformer";
import { BranchStatus, BranchType, DayOfWeek } from "../constants/constant";

class CoordinatesDto {
    @IsNumber()
    @ApiProperty({ example: 25.2048 })
    lat: number;

    @IsNumber()
    @ApiProperty({ example: 55.2708 })
    lng: number;
}

class AddressDetailDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '123 Main St' })
    street: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Dubai' })
    city: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Dubai' })
    state: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: '00000' })
    zip_code?: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'UAE' })
    country: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'https://maps.google.com/...' })
    map_location_url?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CoordinatesDto)
    @ApiPropertyOptional({ type: CoordinatesDto })
    coordinates?: CoordinatesDto;
}

class OperatingHoursDto {
    @IsEnum(DayOfWeek)
    @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
    day: DayOfWeek;

    @IsString()
    @ApiProperty({ example: '09:00' })
    open_time: string;

    @IsString()
    @ApiProperty({ example: '22:00' })
    close_time: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ default: false })
    is_closed: boolean;
}

class OccupancyStatsDto {
    @IsNumber()
    @ApiProperty({ example: 50 })
    capacity: number;
}

export class CreateBranchDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({example:'Branch1'})
    name:string;

    @IsNotEmpty()
    @IsEnum(BranchType)
    @ApiProperty({ enum: BranchType, example: BranchType.STANDARD })
    branch_type: BranchType;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => AddressDetailDto)
    @ApiProperty({ type: AddressDetailDto })
    address_detail: AddressDetailDto;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({example:'9876543210'})
    phone:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({example:'69948af4435dccf179e3e939'})
    organization_id:string;

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({example:'branch1@gmail.com'})
    email:string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: '69948af4435dccf179e3e939' })
    manager_id?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OperatingHoursDto)
    @ApiProperty({ type: [OperatingHoursDto] })
    operating_hours: OperatingHoursDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => OccupancyStatsDto)
    @ApiPropertyOptional({ type: OccupancyStatsDto })
    occupancy_stats?: OccupancyStatsDto;

    @IsOptional()
    @IsEnum(BranchStatus)
    @ApiProperty({ enum: BranchStatus, example: BranchStatus.ACTIVE })
    status: BranchStatus;
}