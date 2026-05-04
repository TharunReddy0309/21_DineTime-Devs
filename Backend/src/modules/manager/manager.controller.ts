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
import { CreateManagerDetailsDto, UpdateManagerDetailsDto } from './dto/manager.dto';
import { ManagerService } from './manager.service';

@ApiTags('managers')
@ApiHeader({ name: 'role', required: true, description: 'diner | manager | staff' })
@Controller('managers')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Roles(Role.MANAGER)
  @Get(':id')
  @ApiOperation({ summary: 'Get manager profile by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiNotFoundResponse({ description: 'Manager not found' })
  findOne(@Param('id') id: string) {
    return { data: this.managerService.findOne(id) };
  }

  @Roles(Role.MANAGER)
  @Post()
  @ApiOperation({ summary: 'Create manager profile' })
  @ApiBody({ type: CreateManagerDetailsDto })
  @ApiCreatedResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid manager payload' })
  create(@Body() dto: CreateManagerDetailsDto) {
    return { data: this.managerService.create(dto) };
  }

  @Roles(Role.MANAGER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update manager profile' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateManagerDetailsDto })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid manager payload' })
  @ApiNotFoundResponse({ description: 'Manager not found' })
  update(@Param('id') id: string, @Body() dto: UpdateManagerDetailsDto) {
    return { data: this.managerService.update(id, dto) };
  }
}
