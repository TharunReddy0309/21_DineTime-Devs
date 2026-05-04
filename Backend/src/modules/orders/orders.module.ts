import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { OrdersController } from 'src/modules/orders/orders.controller';
import { OrdersService } from 'src/modules/orders/orders.service';

@Module({
  imports: [NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
