import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import { BranchStatus } from "../constants/constant";

export class CreateBranchDto {
    @IsNotEmpty()
    @ApiProperty({example:'Branch1'})
    name:string;

    @IsNotEmpty()
    @ApiProperty({example: '123 Main St, Dubai'})
    address:string;

    @IsNotEmpty()
    @ApiProperty({example:'9876543210'})
    phone:string;

    @IsNotEmpty()
    @ApiProperty({example:'69948af4435dccf179e3e939'})
    organization_id:string;

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({example:'branch1@gmail.com'})
    email:string;

    @ApiProperty({example:BranchStatus.ACTIVE})
    status:string;
}