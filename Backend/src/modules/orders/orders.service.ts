import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateId } from 'src/common/utils/id.util';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { CreateOrderDto, UpdateOrderDto } from 'src/modules/orders/dto/orders.dto';
import { MenuRepository } from 'src/repositories/menu.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { ReservationRepository } from 'src/repositories/reservation.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly menuRepository: MenuRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll(reservationId?: string) {
    if (reservationId) {
      return this.orderRepository.findOrdersByReservationId(reservationId).map((order) => ({
        ...order,
        status: order.order_status,
        items: this.orderRepository.findOrderItems(order.id),
      }));
    }

    return this.orderRepository.findAllOrders().map((order) => ({
      ...order,
      status: order.order_status,
      items: this.orderRepository.findOrderItems(order.id),
    }));
  }

  findOne(id: string) {
    const order = this.orderRepository.findOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      ...order,
      status: order.order_status,
      items: this.orderRepository.findOrderItems(order.id),
    };
  }

  create(dto: CreateOrderDto) {
    const reservation = this.reservationRepository.findById(dto.reservation_id);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.reservation_status === 'cancelled') {
      throw new BadRequestException('Cannot place order for cancelled reservation');
    }

    if (dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    dto.items.forEach((item) => {
      const menuItem = this.menuRepository.findById(item.item_id);
      if (!menuItem) {
        throw new NotFoundException(`Menu item not found: ${item.item_id}`);
      }
      if (!menuItem.availability) {
        throw new BadRequestException(`Menu item unavailable: ${menuItem.item_name}`);
      }
    });

    const order = this.orderRepository.createOrder({
      id: generateId('order'),
      reservation_id: dto.reservation_id,
      order_status: 'placed',
      order_time: new Date().toISOString(),
    });

    const items = dto.items.map((item) =>
      this.orderRepository.createOrderItem({
        order_id: order.id,
        item_id: item.item_id,
        quantity: item.quantity,
        price: item.price,
      }),
    );

    this.notificationsService.create(
      reservation.user_id,
      'Order placed successfully',
      'order_update',
    );

    return {
      ...order,
      status: order.order_status,
      items,
    };
  }

  update(id: string, dto: UpdateOrderDto) {
    const order = this.orderRepository.findOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updated = this.orderRepository.updateOrder(id, dto);
    if (!updated) {
      throw new NotFoundException('Order not found');
    }

    const reservation = this.reservationRepository.findById(updated.reservation_id);
    if (reservation) {
      this.notificationsService.create(
        reservation.user_id,
        `Order status updated to ${updated.order_status}`,
        'order_update',
      );
    }

    return {
      ...updated,
      status: updated.order_status,
      items: this.orderRepository.findOrderItems(updated.id),
    };
  }

  delete(id: string) {
    const deleted = this.orderRepository.removeOrder(id);
    if (!deleted) {
      throw new NotFoundException('Order not found');
    }

    return { deleted: true };
  }
}
