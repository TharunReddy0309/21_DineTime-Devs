import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateDinerDetailsDto {
  @ApiProperty()
  @IsString()
  diner_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  loyalty_points?: number;
}

export class UpdateDinerDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  loyalty_points?: number;
}
