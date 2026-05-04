import { Module } from '@nestjs/common';
import { TableslotsController } from 'src/modules/tableslots/tableslots.controller';
import { TableslotsService } from 'src/modules/tableslots/tableslots.service';

@Module({
  controllers: [TableslotsController],
  providers: [TableslotsService],
  exports: [TableslotsService],
})
export class TableslotsModule {}
