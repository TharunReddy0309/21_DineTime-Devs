import { Injectable, NotFoundException } from '@nestjs/common';
import { generateId } from 'src/common/utils/id.util';
import {
  CreateSettingDto,
  UpdateSettingDto,
  UpdateUserSettingDto,
} from 'src/modules/settings/dto/settings.dto';
import { SettingsRepository } from 'src/repositories/settings.repository';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  getSettings(role?: string) {
    if (role) {
      return this.settingsRepository.findSettingsByRole(role as any);
    }

    return this.settingsRepository.findAllSettings();
  }

  createSetting(dto: CreateSettingDto) {
    return this.settingsRepository.createSetting({
      id: generateId('setting'),
      key: dto.key,
      description: dto.description,
      role: dto.role,
    });
  }

  updateSetting(id: string, dto: UpdateSettingDto) {
    const updated = this.settingsRepository.updateSetting(id, dto);
    if (!updated) {
      throw new NotFoundException('Setting not found');
    }

    return updated;
  }

  deleteSetting(id: string) {
    const deleted = this.settingsRepository.removeSetting(id);
    if (!deleted) {
      throw new NotFoundException('Setting not found');
    }

    return { deleted: true };
  }

  getUserSettings(userId: string) {
    return this.settingsRepository.findUserSettingsByUserId(userId);
  }

  updateUserSetting(userSettingId: string, dto: UpdateUserSettingDto) {
    const updated = this.settingsRepository.updateUserSetting(userSettingId, {
      value: dto.value,
    });

    if (!updated) {
      throw new NotFoundException('User setting not found');
    }

    return updated;
  }
}
