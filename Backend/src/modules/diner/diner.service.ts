import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDinerDetailsDto, UpdateDinerDetailsDto } from './dto/diner.dto';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class DinerService {
  constructor(private readonly userRepository: UserRepository) {}

  findOne(id: string) {
    const user = this.userRepository.findById(id);
    if (!user || user.role !== 'diner') {
      throw new NotFoundException('Diner not found');
    }
    const details = this.userRepository.getDinerDetails(id);
    return { ...user, ...details };
  }

  create(dto: CreateDinerDetailsDto) {
    return this.userRepository.upsertDinerDetails({
      diner_id: dto.diner_id,
      loyalty_points: dto.loyalty_points ?? 0,
    });
  }

  update(id: string, dto: UpdateDinerDetailsDto) {
    const existing = this.userRepository.getDinerDetails(id);
    if (!existing) {
      throw new NotFoundException('Diner details not found');
    }

    return this.userRepository.upsertDinerDetails({
      diner_id: id,
      loyalty_points: dto.loyalty_points ?? existing.loyalty_points,
    });
  }
}
