import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MenuSchema } from "./schemas";
import { CategorySchema } from "src/category/schemas";
import { MenuItemSchema } from "src/menu-item/schemas";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Menu',
                schema: MenuSchema
            },
            {
                name: 'Category',
                schema: CategorySchema
            },
            {
                name: "MenuItem",
                schema: MenuItemSchema
            }
        ])
    ]
})

export class MenuModule {
    
}