import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCheckinDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reservation_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  staff_id: string;
}
