import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MergeCartDto {
  @ApiProperty({ description: 'The anonymous cart_token to merge into the authenticated user cart' })
  @IsString()
  guest_cart_token: string;
}
