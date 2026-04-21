import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from '../branches/schema/branches.schema';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { MenuItem, MenuItemSchema } from '../menu-items/schemas/menu-item.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { CustomerMenuController } from './controllers/customer-menu.controller';
import { CustomerMenuService } from './services/customer-menu.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Branch.name, schema: BranchSchema },
      { name: Category.name, schema: CategorySchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [CustomerMenuController],
  providers: [CustomerMenuService],
})
export class CustomerMenuModule {}
