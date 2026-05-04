import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CheckinModule } from 'src/modules/checkin/checkin.module';
import { DinerModule } from 'src/modules/diner/diner.module';
import { MenuModule } from 'src/modules/menu/menu.module';
import { ManagerModule } from 'src/modules/manager/manager.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { PaymentsModule } from 'src/modules/payments/payments.module';
import { ReservationsModule } from 'src/modules/reservations/reservations.module';
import { RestaurantsModule } from 'src/modules/restaurants/restaurants.module';
import { ReviewsModule } from 'src/modules/reviews/reviews.module';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { StaffModule } from 'src/modules/staff/staff.module';
import { SuperAdminModule } from 'src/modules/super-admin/super-admin.module';
import { TablesModule } from 'src/modules/tables/tables.module';
import { TableslotsModule } from 'src/modules/tableslots/tableslots.module';
import { TimeslotsModule } from 'src/modules/timeslots/timeslots.module';
import { UsersModule } from 'src/modules/users/users.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { DataSeederService } from 'src/seed/data-seeder.service';

@Module({
  imports: [
    RepositoriesModule,
    UsersModule,
    DinerModule,
    ManagerModule,
    StaffModule,
    SuperAdminModule,
    RestaurantsModule,
    TablesModule,
    TimeslotsModule,
    TableslotsModule,
    ReservationsModule,
    CheckinModule,
    PaymentsModule,
    MenuModule,
    OrdersModule,
    ReviewsModule,
    NotificationsModule,
    SettingsModule,
  ],
  providers: [
    DataSeederService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
