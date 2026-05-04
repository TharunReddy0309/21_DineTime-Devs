import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateId } from 'src/common/utils/id.util';
import { CreateCheckinDto } from 'src/modules/checkin/dto/checkin.dto';
import { CheckinRepository } from 'src/repositories/checkin.repository';
import { ReservationRepository } from 'src/repositories/reservation.repository';
import { TableSlotRepository } from 'src/repositories/tableslot.repository';

@Injectable()
export class CheckinService {
  constructor(
    private readonly checkinRepository: CheckinRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly tableSlotRepository: TableSlotRepository,
  ) {}

  findAll() {
    return this.checkinRepository.findAll();
  }

  create(dto: CreateCheckinDto) {
    const reservation = this.reservationRepository.findById(dto.reservation_id);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.reservation_status !== 'reserved') {
      throw new BadRequestException('Check-in is only allowed for reserved bookings');
    }

    const existing = this.checkinRepository.findByReservationId(dto.reservation_id);
    if (existing) {
      throw new BadRequestException('Check-in already exists for this reservation');
    }

    if (!reservation.table_id || !reservation.slot_id) {
      throw new BadRequestException('Reservation is missing table or slot reference');
    }

    const checkin = this.checkinRepository.create({
      checkin_id: generateId('checkin'),
      reservation_id: dto.reservation_id,
      staff_id: dto.staff_id,
      checkin_time: new Date().toISOString(),
    });

    this.reservationRepository.update(reservation.id, { reservation_status: 'checked_in' });
    this.tableSlotRepository.updateStatus(reservation.table_id, reservation.slot_id, 'occupied');

    return checkin;
  }
}
