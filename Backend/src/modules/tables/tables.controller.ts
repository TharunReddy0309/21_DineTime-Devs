import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import {
  dataArraySchema,
  dataObjectSchema,
  deletedSchema,
} from 'src/common/swagger/schemas';
import { CreateTableDto, UpdateTableDto } from 'src/modules/tables/dto/tables.dto';
import { TablesService } from 'src/modules/tables/tables.service';

@ApiTags('tables')
@ApiHeader({ name: 'role', required: true, description: 'diner | manager | staff' })
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Roles(Role.DINER, Role.MANAGER, Role.STAFF, Role.SUPER_USER)
  @Get()
  @ApiOperation({ summary: 'List tables' })
  @ApiQuery({ name: 'restaurant_id', required: false })
  @ApiOkResponse({ schema: dataArraySchema })
  findAll(@Query('restaurant_id') restaurantId?: string) {
    return { data: this.tablesService.findAll(restaurantId) };
  }

  @Roles(Role.DINER, Role.MANAGER, Role.STAFF, Role.SUPER_USER)
  @Get(':id')
  @ApiOperation({ summary: 'Get table by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiNotFoundResponse({ description: 'Table not found' })
  findOne(@Param('id') id: string) {
    return { data: this.tablesService.findOne(id) };
  }

  @Roles(Role.MANAGER, Role.SUPER_USER)
  @Post()
  @ApiOperation({ summary: 'Create table' })
  @ApiBody({ type: CreateTableDto })
  @ApiCreatedResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid table payload' })
  create(@Body() dto: CreateTableDto) {
    return { data: this.tablesService.create(dto) };
  }

  @Roles(Role.MANAGER, Role.SUPER_USER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update table' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateTableDto })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid table payload' })
  @ApiNotFoundResponse({ description: 'Table not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTableDto) {
    return { data: this.tablesService.update(id, dto) };
  }

  @Roles(Role.MANAGER, Role.SUPER_USER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete table' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: deletedSchema })
  @ApiNotFoundResponse({ description: 'Table not found' })
  delete(@Param('id') id: string) {
    return { data: this.tablesService.delete(id) };
  }
}
