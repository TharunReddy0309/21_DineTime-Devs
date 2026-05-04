import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateManagerDetailsDto, UpdateManagerDetailsDto } from './dto/manager.dto';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class ManagerService {
  constructor(private readonly userRepository: UserRepository) {}

  findOne(id: string) {
    const user = this.userRepository.findById(id);
    if (!user || user.role !== 'manager') {
      throw new NotFoundException('Manager not found');
    }
    const details = this.userRepository.getManagerDetails(id);
    return { ...user, ...details };
  }

  create(dto: CreateManagerDetailsDto) {
    return this.userRepository.upsertManagerDetails({
      manager_id: dto.manager_id,
      business_license_number: dto.business_license_number,
      government_id: dto.government_id,
      verified_status: dto.verified_status ?? false,
    });
  }

  update(id: string, dto: UpdateManagerDetailsDto) {
    const existing = this.userRepository.getManagerDetails(id);
    if (!existing) {
      throw new NotFoundException('Manager details not found');
    }

    return this.userRepository.upsertManagerDetails({
      manager_id: id,
      business_license_number:
        dto.business_license_number ?? existing.business_license_number,
      government_id: dto.government_id ?? existing.government_id,
      verified_status: dto.verified_status ?? existing.verified_status,
    });
  }
}
