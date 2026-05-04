import { Module } from '@nestjs/common';
import { NotificationsController } from 'src/modules/notifications/notifications.controller';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
