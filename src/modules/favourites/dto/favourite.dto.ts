import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CustomerMenuItemDto } from '../../customer-menu/dto/get-branch-menu.dto';

export class AddFavouriteDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '65d8f7a9e1b2c3d4e5f6a7b8', description: 'menu_item id' })
  menu_item_id: string;
}

export class FavouriteIdsResponseDto {
  @ApiProperty({ type: [String] })
  menu_item_ids: string[];
}

export class FavouriteItemsResponseDto {
  @ApiProperty({ type: [CustomerMenuItemDto] })
  items: CustomerMenuItemDto[];
}
