import { ApiProperty } from '@nestjs/swagger';
import {IsIn, IsNotEmpty, IsOptional, IsString} from 'class-validator'

export class CreateOrganizationDTO {
    @ApiProperty({ example: 'My Restaurant', description: 'The name of the organization' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Dubai, UAE', description: 'The address of the organization' })
    @IsString()
    address: string;

    @ApiProperty({ example: 'AED', enum: ['AED', 'INR'], description: 'The currency of the organization' })
    @IsIn(['AED', 'INR'])
    @IsNotEmpty()
    currency: 'AED' | 'INR';

    @ApiProperty({ example: 'Asia/Dubai', enum: ['Asia/Kolkata', 'Asia/Dubai'], description: 'The timezone of the organization' })
    @IsIn(['Asia/Kolkata', 'Asia/Dubai'])
    @IsNotEmpty()
    timezone: 'Asia/Kolkata' | 'Asia/Dubai';
}

export class UpdateOrganizationDTO {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ required: false, enum: ['AED', 'INR'] })
    @IsIn(['AED', 'INR'])
    @IsOptional()
    currency?: 'AED' | 'INR';

    @ApiProperty({ required: false, enum: ['Asia/Kolkata', 'Asia/Dubai'] })
    @IsIn(['Asia/Kolkata', 'Asia/Dubai'])
    @IsOptional()
    timezone?: 'Asia/Kolkata' | 'Asia/Dubai';

    @ApiProperty({ required: false, enum: ['active', 'pending', 'suspended'] })
    @IsIn(['active', 'pending', 'suspended'])
    @IsOptional()
    status?: 'active' | 'pending' | 'suspended';
}