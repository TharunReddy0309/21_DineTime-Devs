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
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  dataArraySchema,
  dataObjectSchema,
  deletedSchema,
} from 'src/common/swagger/schemas';
import {
  CreateSettingDto,
  UpdateSettingDto,
  UpdateUserSettingDto,
} from 'src/modules/settings/dto/settings.dto';
import { SettingsService } from 'src/modules/settings/settings.service';

@ApiTags('settings')
@ApiHeader({ name: 'role', required: true, description: 'diner | manager | staff' })
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Roles(Role.DINER, Role.MANAGER, Role.STAFF)
  @Get()
  @ApiOperation({ summary: 'List settings' })
  @ApiQuery({ name: 'role', required: false })
  @ApiOkResponse({ schema: dataArraySchema })
  findAll(@Query('role') role?: string) {
    return { data: this.settingsService.getSettings(role) };
  }

  @Roles(Role.MANAGER)
  @Post()
  @ApiOperation({ summary: 'Create setting' })
  @ApiBody({ type: CreateSettingDto })
  @ApiCreatedResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid setting payload' })
  create(@Body() dto: CreateSettingDto) {
    return { data: this.settingsService.createSetting(dto) };
  }

  @Roles(Role.MANAGER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update setting' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateSettingDto })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid setting payload' })
  @ApiNotFoundResponse({ description: 'Setting not found' })
  update(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
    return { data: this.settingsService.updateSetting(id, dto) };
  }

  @Roles(Role.MANAGER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete setting' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: deletedSchema })
  @ApiNotFoundResponse({ description: 'Setting not found' })
  remove(@Param('id') id: string) {
    return { data: this.settingsService.deleteSetting(id) };
  }

  @Roles(Role.DINER, Role.MANAGER, Role.STAFF)
  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user settings' })
  @ApiParam({ name: 'userId' })
  @ApiOkResponse({ schema: dataArraySchema })
  @ApiNotFoundResponse({ description: 'User settings not found' })
  getUserSettings(@Param('userId') userId: string) {
    return { data: this.settingsService.getUserSettings(userId) };
  }

  @Roles(Role.DINER, Role.MANAGER, Role.STAFF)
  @Patch('users/:userSettingId')
  @ApiOperation({ summary: 'Update user setting' })
  @ApiParam({ name: 'userSettingId' })
  @ApiBody({ type: UpdateUserSettingDto })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid user setting payload' })
  @ApiNotFoundResponse({ description: 'User setting not found' })
  updateUserSetting(
    @Param('userSettingId') userSettingId: string,
    @Body() dto: UpdateUserSettingDto,
  ) {
    return { data: this.settingsService.updateUserSetting(userSettingId, dto) };
  }
}
