import { Injectable, NotFoundException } from '@nestjs/common';
import { generateId } from 'src/common/utils/id.util';
import { CreateMenuItemDto, UpdateMenuItemDto } from 'src/modules/menu/dto/menu.dto';
import { MenuRepository } from 'src/repositories/menu.repository';

@Injectable()
export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) {}

  findAll(restaurantId?: string) {
    if (restaurantId) {
      return this.menuRepository.findByRestaurantId(restaurantId).map((item) => ({
        ...item,
        name: item.item_name,
        is_available: item.availability,
      }));
    }

    return this.menuRepository.findAll().map((item) => ({
      ...item,
      name: item.item_name,
      is_available: item.availability,
    }));
  }

  findOne(id: string) {
    const item = this.menuRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    return {
      ...item,
      name: item.item_name,
      is_available: item.availability,
    };
  }

  create(dto: CreateMenuItemDto) {
    const item = this.menuRepository.create({
      id: generateId('menu'),
      restaurant_id: dto.restaurant_id,
      item_name: dto.item_name ?? dto.name ?? '',
      category: dto.category,
      price: dto.price,
      availability: dto.availability,
      image_urls: dto.image_urls ?? [],
    });

    return {
      ...item,
      name: item.item_name,
      is_available: item.availability,
    };
  }

  update(id: string, dto: UpdateMenuItemDto) {
    const updated = this.menuRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Menu item not found');
    }

    return {
      ...updated,
      name: updated.item_name,
      is_available: updated.availability,
    };
  }

  delete(id: string) {
    const deleted = this.menuRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException('Menu item not found');
    }

    return { deleted: true };
  }
}
