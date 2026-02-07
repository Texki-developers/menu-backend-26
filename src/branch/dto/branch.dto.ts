import { IsBoolean, IsIn, IsLatitude, IsLongitude, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested, isObject } from "class-validator";
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger';

// ------------- UTILITIES ----------
export class GeoLocationDTO {
    @ApiProperty({ example: 25.2048, description: 'Latitude' })
    @IsLatitude()
    latitude: number;
  
    @ApiProperty({ example: 55.2708, description: 'Longitude' })
    @IsLongitude()
    longitude: number;
}

export class BranchSupportDTO {
    @ApiProperty()
    @IsBoolean()
    dineIn: boolean;
  
    @ApiProperty()
    @IsBoolean()
    takeaway: boolean;
  
    @ApiProperty()
    @IsBoolean()
    delivery: boolean;
  }

export class CashProviderDTO {
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    enabled: boolean;
}

export class RazorpayProviderDTO {
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    enabled: boolean;

    @ApiProperty()
    @IsString()
    @IsOptional()
    keyId: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    keySecret: string;
}

export class PaymentProvidersDTO {
    @ApiProperty({ type: CashProviderDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => CashProviderDTO)
    @IsOptional()
    cash?: CashProviderDTO;

    @ApiProperty({ type: RazorpayProviderDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => RazorpayProviderDTO)
    @IsOptional()
    razorpay?: RazorpayProviderDTO;
}
// ------------- UTILITIES ----------


export class CreateBranchDTO {
    @ApiProperty({ example: 'Downtown Branch' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'BR001' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'my-restaurant-slug' })
    @IsString()
    @IsNotEmpty()
    organizationSlug: string;

    @ApiProperty({ example: 'Sheikh Zayed Road' })
    @IsString()
    @IsOptional()
    address: string;

    @ApiProperty({ type: GeoLocationDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => GeoLocationDTO)
    @IsNotEmpty()
    geoLocation: GeoLocationDTO

    @ApiProperty({ type: BranchSupportDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => BranchSupportDTO)
    @IsOptional()
    supports: BranchSupportDTO

    @ApiProperty({ type: PaymentProvidersDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => PaymentProvidersDTO)
    @IsOptional()
    paymentProviders: PaymentProvidersDTO;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    isActive: boolean;
}

export class UpdateBranchDTO {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiProperty({ required: false })
    @IsMongoId()
    @IsOptional()
    organizationId?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ required: false, enum: ['AED', 'INR'] })
    @IsIn(['AED', 'INR'])
    @IsNotEmpty()
    currency: 'AED' | 'INR';
    
    @ApiProperty({ required: false, enum: ['Asia/Kolkata', 'Asia/Dubai'] })
    @IsIn(['Asia/Kolkata', 'Asia/Dubai'])
    @IsNotEmpty()
    timezone: 'Asia/Kolkata' | 'Asia/Dubai';

    @ApiProperty({ required: false, type: GeoLocationDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => GeoLocationDTO)
    @IsOptional()
    geoLocation?: GeoLocationDTO

    @ApiProperty({ required: false, type: BranchSupportDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => BranchSupportDTO)
    @IsOptional()
    supports?: BranchSupportDTO

    @ApiProperty({ required: false, type: PaymentProvidersDTO })
    @IsObject()
    @ValidateNested()
    @Type(() => PaymentProvidersDTO)
    @IsOptional()
    paymentProviders?: PaymentProvidersDTO;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}