import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { ReservationsController } from 'src/modules/reservations/reservations.controller';
import { ReservationsService } from 'src/modules/reservations/reservations.service';

@Module({
  imports: [NotificationsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
