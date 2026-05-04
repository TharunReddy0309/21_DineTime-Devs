import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { dataObjectSchema } from 'src/common/swagger/schemas';
import { CreateStaffDetailsDto, UpdateStaffDetailsDto } from './dto/staff.dto';
import { StaffService } from './staff.service';

@ApiTags('staff')
@ApiHeader({ name: 'role', required: true, description: 'diner | manager | staff' })
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Roles(Role.STAFF)
  @Get(':id')
  @ApiOperation({ summary: 'Get staff profile by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiNotFoundResponse({ description: 'Staff member not found' })
  findOne(@Param('id') id: string) {
    return { data: this.staffService.findOne(id) };
  }

  @Roles(Role.STAFF)
  @Post()
  @ApiOperation({ summary: 'Create staff profile' })
  @ApiBody({ type: CreateStaffDetailsDto })
  @ApiCreatedResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid staff payload' })
  create(@Body() dto: CreateStaffDetailsDto) {
    return { data: this.staffService.create(dto) };
  }

  @Roles(Role.STAFF)
  @Patch(':id')
  @ApiOperation({ summary: 'Update staff profile' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateStaffDetailsDto })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid staff payload' })
  @ApiNotFoundResponse({ description: 'Staff member not found' })
  update(@Param('id') id: string, @Body() dto: UpdateStaffDetailsDto) {
    return { data: this.staffService.update(id, dto) };
  }
}
