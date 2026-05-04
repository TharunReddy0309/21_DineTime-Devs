import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { PaymentsController } from 'src/modules/payments/payments.controller';
import { PaymentsService } from 'src/modules/payments/payments.service';

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
