import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStaffDetailsDto, UpdateStaffDetailsDto } from './dto/staff.dto';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class StaffService {
  constructor(private readonly userRepository: UserRepository) {}

  findOne(id: string) {
    const user = this.userRepository.findById(id);
    if (!user || user.role !== 'staff') {
      throw new NotFoundException('Staff not found');
    }
    const details = this.userRepository.getStaffDetails(id);
    return { ...user, ...details };
  }

  create(dto: CreateStaffDetailsDto) {
    return this.userRepository.upsertStaffDetails({
      staff_id: dto.staff_id,
      restaurant_id: dto.restaurant_id,
      employee_code: dto.employee_code,
      role_type: dto.role_type ?? 'service',
    });
  }

  update(id: string, dto: UpdateStaffDetailsDto) {
    const existing = this.userRepository.getStaffDetails(id);
    if (!existing) {
      throw new NotFoundException('Staff details not found');
    }

    return this.userRepository.upsertStaffDetails({
      staff_id: id,
      restaurant_id: dto.restaurant_id ?? existing.restaurant_id,
      employee_code: dto.employee_code ?? existing.employee_code,
      role_type: dto.role_type ?? existing.role_type,
    });
  }
}
