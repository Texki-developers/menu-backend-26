import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderSchema } from "./schemas";
import { OrdersController } from "./order.controller";
import { OrdersService } from "./order.service";

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: 'Order', schema: OrderSchema },
      ]),
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
  })
  export class OrdersModule {}
  