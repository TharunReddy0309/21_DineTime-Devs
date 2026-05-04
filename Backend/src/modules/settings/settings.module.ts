import { Module } from '@nestjs/common';
import { SettingsController } from 'src/modules/settings/settings.controller';
import { SettingsService } from 'src/modules/settings/settings.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
