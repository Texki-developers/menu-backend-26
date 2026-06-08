import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FavouritesService } from '../services/favourites.service';
import {
  AddFavouriteDto,
  FavouriteIdsResponseDto,
  FavouriteItemsResponseDto,
} from '../dto/favourite.dto';
import { UserId } from '../../../common/decorators/user-id.decorator';

@ApiTags('Customer Favourites')
@ApiBearerAuth()
@Controller('customer/me/favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Get('ids')
  @ApiOperation({ summary: "List the current customer's favourite menu_item ids" })
  @ApiResponse({ status: HttpStatus.OK, type: FavouriteIdsResponseDto })
  listIds(@UserId() customerId: string) {
    return this.favouritesService.listIds(customerId);
  }

  @Get()
  @ApiOperation({ summary: "List the current customer's favourite items (enriched)" })
  @ApiResponse({ status: HttpStatus.OK, type: FavouriteItemsResponseDto })
  list(@UserId() customerId: string) {
    return this.favouritesService.listEnriched(customerId);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save a menu item to favourites (idempotent)' })
  add(@UserId() customerId: string, @Body() dto: AddFavouriteDto) {
    return this.favouritesService.add(customerId, dto.menu_item_id);
  }

  @Delete(':menuItemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a menu item from favourites' })
  remove(@UserId() customerId: string, @Param('menuItemId') menuItemId: string) {
    return this.favouritesService.remove(customerId, menuItemId);
  }
}
