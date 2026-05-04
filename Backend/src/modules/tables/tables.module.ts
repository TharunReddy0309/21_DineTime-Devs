import { Module } from '@nestjs/common';
import { TablesController } from 'src/modules/tables/tables.controller';
import { TablesService } from 'src/modules/tables/tables.service';

@Module({
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
