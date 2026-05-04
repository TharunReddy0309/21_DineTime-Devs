import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateManagerDetailsDto {
  @ApiProperty()
  @IsString()
  manager_id: string;

  @ApiProperty()
  @IsString()
  business_license_number: string;

  @ApiProperty()
  @IsString()
  government_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  verified_status?: boolean;
}

export class UpdateManagerDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  business_license_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  government_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  verified_status?: boolean;
}
