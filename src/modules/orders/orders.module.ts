import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './controllers/order.controller';
import { PublicOrderController } from './controllers/public-order.controller';
import { OrderService } from './services/order.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CartModule,
  ],
  controllers: [OrderController, PublicOrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrdersModule {}
