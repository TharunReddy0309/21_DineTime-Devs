import { Injectable } from '@nestjs/common';
import { TableSlot, TableSlotStatus } from 'src/common/types/schema.types';

@Injectable()
export class TableSlotRepository {
  private readonly tableSlots: TableSlot[] = [];

  findAll(): TableSlot[] {
    return [...this.tableSlots];
  }

  findByTableAndSlot(tableId: string, slotId: string): TableSlot | undefined {
    return this.tableSlots.find(
      (item) => item.table_id === tableId && item.slot_id === slotId,
    );
  }

  findBySlotId(slotId: string): TableSlot[] {
    return this.tableSlots.filter((item) => item.slot_id === slotId);
  }

  create(tableSlot: TableSlot): TableSlot {
    const existing = this.findByTableAndSlot(tableSlot.table_id, tableSlot.slot_id);
    if (existing) {
      return existing;
    }

    this.tableSlots.push(tableSlot);
    return tableSlot;
  }

  updateStatus(tableId: string, slotId: string, status: TableSlotStatus): TableSlot | undefined {
    const entry = this.findByTableAndSlot(tableId, slotId);
    if (!entry) {
      return undefined;
    }

    entry.status = status;
    return entry;
  }

  removeByTableId(tableId: string): void {
    for (let i = this.tableSlots.length - 1; i >= 0; i -= 1) {
      if (this.tableSlots[i].table_id === tableId) {
        this.tableSlots.splice(i, 1);
      }
    }
  }

  removeBySlotId(slotId: string): void {
    for (let i = this.tableSlots.length - 1; i >= 0; i -= 1) {
      if (this.tableSlots[i].slot_id === slotId) {
        this.tableSlots.splice(i, 1);
      }
    }
  }
}
