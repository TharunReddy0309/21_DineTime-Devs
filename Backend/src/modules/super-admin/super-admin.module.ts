import { Module } from '@nestjs/common';
import { SuperAdminController } from 'src/modules/super-admin/super-admin.controller';
import { SuperAdminService } from 'src/modules/super-admin/super-admin.service';

@Module({
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}
