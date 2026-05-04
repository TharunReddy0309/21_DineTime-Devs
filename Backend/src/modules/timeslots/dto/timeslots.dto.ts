import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTimeSlotDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  restaurant_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slot_date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  end_time: string;
}

export class UpdateTimeSlotDto {
  @ApiPropertyOptional()
  @IsString()
  restaurant_id?: string;

  @ApiPropertyOptional()
  @IsString()
  slot_date?: string;

  @ApiPropertyOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional()
  @IsString()
  end_time?: string;
}
