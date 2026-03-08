import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { BranchStatus } from "../constants/constant";

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export class GetAllBranchesDto {
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

    @ApiPropertyOptional({ example: '69948af4435dccf179e3e939', description: 'Organization ID (optional, handled by backend)' })
    @IsOptional()
    @IsString()
    organization_id?: string;

    @ApiPropertyOptional({ enum: BranchStatus, example: BranchStatus.ACTIVE })
    @IsOptional()
    @IsEnum(BranchStatus)
    status?: BranchStatus;

    @ApiPropertyOptional({ example: 'created_at' })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.DESC })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;
}