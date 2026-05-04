import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { generateId } from 'src/common/utils/id.util';
import { CreateTableDto, UpdateTableDto } from 'src/modules/tables/dto/tables.dto';
import { TableRepository } from 'src/repositories/table.repository';
import { TableSlotRepository } from 'src/repositories/tableslot.repository';
import { TimeSlotRepository } from 'src/repositories/timeslot.repository';

@Injectable()
export class TablesService {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly tableSlotRepository: TableSlotRepository,
  ) {}

  findAll(restaurantId?: string) {
    if (restaurantId) {
      return this.tableRepository.findByRestaurantId(restaurantId);
    }

    return this.tableRepository.findAll();
  }

  findOne(id: string) {
    const table = this.tableRepository.findById(id);
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  create(dto: CreateTableDto) {
    const existingSameNumber = this.tableRepository
      .findByRestaurantId(dto.restaurant_id)
      .find((table) => Number(table.table_number) === Number(dto.table_number));
    if (existingSameNumber) {
      throw new BadRequestException('Table number already exists for this restaurant');
    }

    const table = this.tableRepository.create({
      id: generateId('table'),
      restaurant_id: dto.restaurant_id,
      table_number: dto.table_number,
      capacity: dto.capacity,
    });

    const slots = this.timeSlotRepository.findByRestaurantId(dto.restaurant_id);
    slots.forEach((slot) => {
      this.tableSlotRepository.create({
        id: generateId('table_slot'),
        table_id: table.id,
        slot_id: slot.id,
        status: 'available',
      });
    });

    return table;
  }

  update(id: string, dto: UpdateTableDto) {
    const existing = this.tableRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Table not found');
    }

    const nextRestaurantId = dto.restaurant_id ?? existing.restaurant_id;
    const nextTableNumber = dto.table_number ?? existing.table_number;
    const conflict = this.tableRepository
      .findByRestaurantId(nextRestaurantId)
      .find(
        (table) =>
          table.id !== id && Number(table.table_number) === Number(nextTableNumber),
      );
    if (conflict) {
      throw new BadRequestException('Table number already exists for this restaurant');
    }

    const updated = this.tableRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Table not found');
    }

    return updated;
  }

  delete(id: string) {
    const deleted = this.tableRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Table not found');
    }

    this.tableSlotRepository.removeByTableId(id);
    return { deleted: true };
  }
}
