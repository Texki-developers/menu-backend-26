import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from '../menu-items/schemas/menu-item.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Favourite, FavouriteSchema } from './schemas/favourite.schema';
import { FavouritesController } from './controllers/favourites.controller';
import { FavouritesService } from './services/favourites.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favourite.name, schema: FavouriteSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [FavouritesController],
  providers: [FavouritesService],
})
export class FavouritesModule {}
