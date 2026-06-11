import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private checkAdmin(req: any) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    if (!user.isActived) {
      throw new UnauthorizedException('El usuario no está activo');
    }
    if (!user.isAdmin && !user.isSuperAdmin) {
      throw new UnauthorizedException('Acceso restringido solo a administradores');
    }
    return user;
  }

  @Get('past-events')
  async getPastEventsReport(
    @Req() req: any,
    @Query('idCampaign') idCampaign: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = this.checkAdmin(req);
    return this.reportsService.getPastEventsReport(user.company, idCampaign, startDate, endDate);
  }

  @Get('upcoming-events')
  async getUpcomingEventsReport(
    @Req() req: any,
    @Query('idCampaign') idCampaign: string,
  ) {
    const user = this.checkAdmin(req);
    return this.reportsService.getUpcomingEventsReport(user.company, idCampaign);
  }

  @Get('leaders-followers')
  async getLeadersFollowersReport(
    @Req() req: any,
    @Query('idCampaign') idCampaign: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = this.checkAdmin(req);
    return this.reportsService.getLeadersFollowersReport(user.company, idCampaign, startDate, endDate);
  }

  @Get('leaders-performance')
  async getLeadersPerformanceReport(
    @Req() req: any,
    @Query('idCampaign') idCampaign: string,
  ) {
    const user = this.checkAdmin(req);
    return this.reportsService.getLeadersPerformanceReport(user.company, idCampaign);
  }

  @Get('detailed-attendance')
  async getDetailedAttendanceReport(
    @Req() req: any,
    @Query('idCampaign') idCampaign: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = this.checkAdmin(req);
    return this.reportsService.getDetailedAttendanceReport(user.company, idCampaign, startDate, endDate);
  }

  @Get('geo-distribution')
  async getGeoDistributionReport(
    @Req() req: any,
    @Query('idCampaign') idCampaign: string,
  ) {
    const user = this.checkAdmin(req);
    return this.reportsService.getGeoDistributionReport(user.company, idCampaign);
  }

  @Get('demographics')
  async getDemographicsReport(
    @Req() req: any,
    @Query('idCampaign') idCampaign: string,
  ) {
    const user = this.checkAdmin(req);
    return this.reportsService.getDemographicsReport(user.company, idCampaign);
  }

  @Get('stats-pdf')
  async getStatsPDFReport(
    @Req() req: any,
    @Query('idCampaign') idCampaign: string,
  ) {
    const user = this.checkAdmin(req);
    return this.reportsService.getStatsPDFReport(user.company, idCampaign);
  }
}
