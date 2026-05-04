import { Module } from '@nestjs/common';
import { DinerController } from './diner.controller';
import { DinerService } from './diner.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [DinerController],
  providers: [DinerService],
})
export class DinerModule {}
