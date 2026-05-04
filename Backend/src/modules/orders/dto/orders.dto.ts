import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/common/types/schema.types';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  item_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  menu_item_id?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reservation_id: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ enum: ['placed', 'preparing', 'served', 'completed'] })
  @IsEnum(['placed', 'preparing', 'served', 'completed'])
  order_status?: OrderStatus;
}
