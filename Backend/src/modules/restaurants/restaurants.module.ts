import { Module } from '@nestjs/common';
import { RestaurantsController } from 'src/modules/restaurants/restaurants.controller';
import { RestaurantsService } from 'src/modules/restaurants/restaurants.service';

@Module({
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
