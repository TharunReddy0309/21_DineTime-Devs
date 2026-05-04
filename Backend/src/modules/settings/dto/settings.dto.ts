import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class CreateSettingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;
}

export class UpdateSettingDto {
  @ApiPropertyOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserSettingDto {
  @ApiProperty()
  @IsBoolean()
  value: boolean;
}
