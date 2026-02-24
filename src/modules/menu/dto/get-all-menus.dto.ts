import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { MenuStatus } from "../constants/constant";
import { SortOrder } from "../../../common/interfaces/pagination.interface";

export class GetAllMenusDto {
    @ApiPropertyOptional({ example: 'search query' })
    @IsOptional()
    @IsString()
    query?: string;

    @ApiPropertyOptional({ example: '1' })
    @IsOptional()
    @IsString()
    page?: string;

    @ApiPropertyOptional({ example: '10' })
    @IsOptional()
    @IsString()
    limit?: string;

    @ApiPropertyOptional({ example: '69948af4435dccf179e3e939' })
    @IsOptional()
    @IsString()
    organization_id?: string;

    @ApiPropertyOptional({ enum: MenuStatus, example: MenuStatus.ACTIVE })
    @IsOptional()
    @IsEnum(MenuStatus)
    status?: MenuStatus;

    @ApiPropertyOptional({ example: 'created_at' })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.DESC })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;
}
