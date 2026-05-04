import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';
import { generateId } from 'src/common/utils/id.util';
import {
  BroadcastNotificationDto,
  CreateNotificationDto,
  UpdateNotificationDto,
} from 'src/modules/notifications/dto/notifications.dto';
import { NotificationRepository } from 'src/repositories/notification.repository';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  findAll(userId?: string) {
    if (userId) {
      return this.notificationRepository.findByUserId(userId);
    }

    return this.notificationRepository.findAll();
  }

  create(userId: string, message: string, type: string) {
    return this.notificationRepository.create({
      id: generateId('notification'),
      user_id: userId,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  createFromDto(dto: CreateNotificationDto) {
    return this.create(dto.user_id, dto.message, dto.type);
  }

  broadcast(dto: BroadcastNotificationDto) {
    const users = this.userRepository.findAll().filter((user) =>
      dto.role ? user.role === dto.role : user.role !== Role.SUPER_USER,
    );

    return users.map((user) =>
      this.create(user.id, dto.message, dto.type ?? 'broadcast'),
    );
  }

  update(id: string, dto: UpdateNotificationDto) {
    const updated = this.notificationRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Notification not found');
    }

    return updated;
  }

  delete(id: string) {
    const deleted = this.notificationRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Notification not found');
    }

    return { deleted: true };
  }
}
