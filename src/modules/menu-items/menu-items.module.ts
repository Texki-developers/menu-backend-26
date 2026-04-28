import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from './schemas/menu-item.schema';
import { MenuItemService } from './services/menu-item.service';
import { MenuItemController } from './controllers/menu-item.controller';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [MenuItemController],
  providers: [MenuItemService],
  exports: [MongooseModule, MenuItemService],
})
export class MenuItemsModule {}
