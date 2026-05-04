import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  restaurant_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  item_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(300)
  price: number;

  @ApiProperty()
  @IsBoolean()
  availability: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image_urls?: string[];
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional()
  @IsString()
  restaurant_id?: string;

  @ApiPropertyOptional()
  @IsString()
  item_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  price?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  availability?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image_urls?: string[];
}
