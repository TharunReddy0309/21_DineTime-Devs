import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
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
import { dataArraySchema, dataObjectSchema, deletedSchema } from 'src/common/swagger/schemas';
import {
  BroadcastNotificationDto,
  CreateNotificationDto,
  UpdateNotificationDto,
} from 'src/modules/notifications/dto/notifications.dto';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

@ApiTags('notifications')
@ApiHeader({ name: 'role', required: true, description: 'diner | manager | staff' })
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(Role.DINER, Role.MANAGER, Role.STAFF, Role.SUPER_USER)
  @Get()
  @ApiOperation({ summary: 'List notifications' })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiOkResponse({ schema: dataArraySchema })
  findAll(@Query('user_id') userId?: string) {
    return { data: this.notificationsService.findAll(userId) };
  }

  @Roles(Role.DINER, Role.MANAGER, Role.STAFF)
  @Post()
  @ApiOperation({ summary: 'Create notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiOkResponse({ schema: dataObjectSchema })
  create(@Body() dto: CreateNotificationDto) {
    return { data: this.notificationsService.createFromDto(dto) };
  }

  @Roles(Role.SUPER_USER)
  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast notification to many users' })
  @ApiBody({ type: BroadcastNotificationDto })
  @ApiOkResponse({ schema: dataArraySchema })
  broadcast(@Body() dto: BroadcastNotificationDto) {
    return { data: this.notificationsService.broadcast(dto) };
  }

  @Roles(Role.DINER, Role.MANAGER, Role.STAFF)
  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiOkResponse({ schema: dataObjectSchema })
  @ApiBadRequestResponse({ description: 'Invalid notification payload' })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  update(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {
    return { data: this.notificationsService.update(id, dto) };
  }

  @Roles(Role.DINER, Role.MANAGER, Role.STAFF)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: deletedSchema })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  remove(@Param('id') id: string) {
    return { data: this.notificationsService.delete(id) };
  }
}
