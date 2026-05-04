import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateTableDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  restaurant_id: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  table_number: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  capacity: number;
}

export class UpdateTableDto {
  @ApiPropertyOptional()
  @IsString()
  restaurant_id?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  table_number?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
