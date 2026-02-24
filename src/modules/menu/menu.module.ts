import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './controller/menu.controller';
import { MenuService } from './services/menu.service';
import { Menu, MenuSchema } from './schema/menu.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }])
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService]
})
export class MenuModule {}
