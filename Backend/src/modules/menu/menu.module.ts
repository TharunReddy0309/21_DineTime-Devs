import { Module } from '@nestjs/common';
import { MenuController } from 'src/modules/menu/menu.controller';
import { MenuService } from 'src/modules/menu/menu.service';

@Module({
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
