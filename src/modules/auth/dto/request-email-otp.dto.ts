import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';

export class RequestEmailOtpDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '60d5ecb5b48777001f7c2232' })
  @IsMongoId()
  @IsNotEmpty()
  branch_id: string;
}
