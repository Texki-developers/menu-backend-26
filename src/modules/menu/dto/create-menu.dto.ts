import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsMongoId, IsBoolean } from "class-validator";
import { MenuStatus, MenuType } from "../constants/constant";

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
    @IsString()
    @ApiPropertyOptional({ example: '11:00' })
    start_time?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: '23:00' })
    end_time?: string;

    @IsOptional()
    @IsEnum(MenuStatus)
    @ApiPropertyOptional({ enum: MenuStatus, example: MenuStatus.ACTIVE, default: MenuStatus.ACTIVE })
    status?: MenuStatus;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional({ example: true, default: true })
    isActive?: boolean;

    @IsNotEmpty()
    @IsMongoId()
    @ApiProperty({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
    organization_id: string;

}
