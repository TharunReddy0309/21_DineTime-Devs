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
import { CreateDinerDetailsDto, UpdateDinerDetailsDto } from './dto/diner.dto';
import { DinerService } from './diner.service';

@ApiTags('diners')
@ApiHeader({ name: 'role', required: true, description: 'diner | manager | staff' })
@Controller('diners')
export class DinerController {
  constructor(private readonly dinerService: DinerService) {}

  @Roles(Role.DINER)
  @Get(':id')
  @ApiOperation({ summary: 'Get diner profile by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiNotFoundResponse({ description: 'Diner not found' })
  findOne(@Param('id') id: string) {
    return { data: this.dinerService.findOne(id) };
  }

  @Roles(Role.DINER)
  @Post()
  @ApiOperation({ summary: 'Create diner profile' })
  @ApiBody({ type: CreateDinerDetailsDto })
  @ApiCreatedResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid diner payload' })
  create(@Body() dto: CreateDinerDetailsDto) {
    return { data: this.dinerService.create(dto) };
  }

  @Roles(Role.DINER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update diner profile' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateDinerDetailsDto })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid diner payload' })
  @ApiNotFoundResponse({ description: 'Diner not found' })
  update(@Param('id') id: string, @Body() dto: UpdateDinerDetailsDto) {
    return { data: this.dinerService.update(id, dto) };
  }
}
