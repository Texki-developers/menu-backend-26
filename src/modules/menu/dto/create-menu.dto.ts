import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsBoolean,
    IsArray,
    ValidateNested,
    Matches,
    ArrayMinSize,
} from "class-validator";
import { MenuStatus, MenuType } from "../constants/constant";
import { DayOfWeek } from "../../branches/constants/constant";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ScheduleWindowDto {
    @IsString()
    @Matches(HHMM, { message: 'start_time must be HH:mm (24-hour)' })
    @ApiProperty({ example: '11:00' })
    start_time: string;

    @IsString()
    @Matches(HHMM, { message: 'end_time must be HH:mm (24-hour)' })
    @ApiProperty({ example: '15:00' })
    end_time: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsEnum(DayOfWeek, { each: true })
    @ApiProperty({ enum: DayOfWeek, isArray: true, example: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY] })
    days: DayOfWeek[];
}

export class CreateMenuDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Main Menu' })
    name: string;

    @IsOptional()
    @IsEnum(MenuType)
    @ApiPropertyOptional({ enum: MenuType, example: MenuType.BOTH, default: MenuType.BOTH })
    type?: MenuType;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'Our standard diverse offering available throughout the day' })
    description?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScheduleWindowDto)
    @ApiPropertyOptional({
        type: [ScheduleWindowDto],
        description: 'Activation windows. Omit or pass [] for always-active.',
    })
    schedule?: ScheduleWindowDto[];

    @IsOptional()
    @IsEnum(MenuStatus)
    @ApiPropertyOptional({ enum: MenuStatus, example: MenuStatus.ACTIVE, default: MenuStatus.ACTIVE })
    status?: MenuStatus;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional({ example: true, default: true })
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8', description: 'Organization ID (optional, handled by backend)' })
    organization_id?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8', description: 'Branch ID (optional, can be provided by admin)' })
    branch_id?: string;
}
