import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsMongoId, IsBoolean } from "class-validator";
import { CategoryIcon } from "../constants/constant";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Appetizers' })
    name: string;

    @IsNotEmpty()
    @IsMongoId()
    @ApiProperty({ example: '69948af4435dccf179e3e939' })
    organization_id: string;

    @IsOptional()
    @IsEnum(CategoryIcon)
    @ApiPropertyOptional({ enum: CategoryIcon, example: CategoryIcon.UTENSILS_CROSSED, default: CategoryIcon.UTENSILS_CROSSED })
    icon?: CategoryIcon;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional({ example: true, default: true })
    isActive?: boolean;

    @IsOptional()
    @IsMongoId()
    @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
    menuId?: string;

    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({ example: 12, default: 0 })
    itemCount?: number;
}
