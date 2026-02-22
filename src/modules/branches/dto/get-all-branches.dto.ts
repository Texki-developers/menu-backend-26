import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { BranchStatus } from "../constants/constant";

export class GetAllBranchesDto {
    @ApiProperty({example:'search query',required:false })
    @IsOptional()
    query?:string;

    @ApiProperty({example:1,required:false})
    @IsOptional()
    page?:number;

    @ApiProperty({example:10,required:false})
    @IsOptional()
    limit?:number;

    @ApiProperty({example:'69948af4435dccf179e3e939',required:false})
    @IsOptional()
    organization_id?:string;

    @ApiProperty({example:BranchStatus.ACTIVE,required:false})
    @IsOptional()
    @IsEnum(BranchStatus)   
    status?:BranchStatus;
}