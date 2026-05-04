import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateStaffDetailsDto {
  @ApiProperty()
  @IsString()
  staff_id: string;

  @ApiProperty()
  @IsString()
  restaurant_id: string;

  @ApiProperty()
  @IsString()
  employee_code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role_type?: string;
}

export class UpdateStaffDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  restaurant_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employee_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role_type?: string;
}
