import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsMongoId, IsBoolean } from "class-validator";
import { CategoryIcon } from "../constants/constant";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Appetizers' })
    name: string;

    @IsOptional()
    @IsEnum(CategoryIcon)
    @ApiPropertyOptional({ enum: CategoryIcon, example: CategoryIcon.UTENSILS_CROSSED, default: CategoryIcon.UTENSILS_CROSSED })
    icon?: CategoryIcon;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'https://cdn.example.com/categories/pizza.jpg', description: 'Public image URL' })
    image_url?: string;

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
    @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
    branch_id?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: '65d8f7a9e1b2c3d4e5f6a7b8' })
    menuId?: string;

}
