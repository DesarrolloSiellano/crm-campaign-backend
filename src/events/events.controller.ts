import { Controller, Get, Post, Body, Param, Delete, Query, Patch, Req, Put, UnauthorizedException, UseGuards, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }



  @Get('findByPage')
  findByPage(
    @Req() req: any,
    @Query('from') from?: number,
    @Query('limite') limite?: number,
    @Query('global') global?: string,
    @Query('filters') filters?: string,
    @Query('idUser') idUser?: string,
    @Query('idCampaign') idCampaign?: string,
  ) {

    const user = req.user;



    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }

    if (!user.isActived) {
      throw new UnauthorizedException('User is not active, please talk to the administrator');
    }


    if (!user.isAdmin) {
      throw new UnauthorizedException('User is not admin, please talk to the administrator');
    }

    // Convierte from y limite a número, o usa valores por defecto
    const fromNumber = from !== undefined ? Number(from) : 0;
    const limiteNumber = limite !== undefined ? Number(limite) : 10;
    return this.eventsService.findByPage(
      fromNumber,
      limiteNumber,
      global,
      filters,
      user.company,
      idUser,
      idCampaign
    );
  }

  @Get('calendar')
  findAllByCalendar(
    @Req() req: any,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('idCampaign') idCampaign?: string,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }

    if (!start || !end) {
      throw new BadRequestException('Start and end dates are required');
    }

    return this.eventsService.findByDateRange(
      start,
      end,
      user.company,
      idCampaign
    );
  }

  @Get('my-events/:userId')
  findAllForUser(@Param('userId') userId: string) {
    return this.eventsService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/attendance-list')
  getAttendanceList(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('globalFilter') globalFilter?: string,
  ) {
    return this.eventsService.getAttendanceList(id, page ? Number(page) : 0, limit ? Number(limit) : 100, globalFilter);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Patch(':id/attendance')
  toggleAttendance(
    @Param('id') id: string,
    @Body() attendanceDto: { attendeeId: string, fullName: string, email: string, phone: string, role: string, status: boolean }
  ) {
    return this.eventsService.toggleAttendance(id, attendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
