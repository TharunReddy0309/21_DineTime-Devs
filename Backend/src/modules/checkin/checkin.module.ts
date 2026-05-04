import { Module } from '@nestjs/common';
import { CheckinController } from 'src/modules/checkin/checkin.controller';
import { CheckinService } from 'src/modules/checkin/checkin.service';

@Module({
  controllers: [CheckinController],
  providers: [CheckinService],
  exports: [CheckinService],
})
export class CheckinModule {}
