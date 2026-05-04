import { Module } from '@nestjs/common';
import { TimeslotsController } from 'src/modules/timeslots/timeslots.controller';
import { TimeslotsService } from 'src/modules/timeslots/timeslots.service';

@Module({
  controllers: [TimeslotsController],
  providers: [TimeslotsService],
  exports: [TimeslotsService],
})
export class TimeslotsModule {}
