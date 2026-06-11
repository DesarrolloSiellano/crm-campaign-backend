import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(
    @Req() req: any,
    @Query('idCampaign') idCampaign: string,
    @Query('limitLeaders') limitLeaders?: number,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    if (!user.isActived) {
      throw new UnauthorizedException('El usuario no está activo');
    }

    const limit = limitLeaders ? Number(limitLeaders) : 5;

    return this.dashboardService.getStats(
      user.company,
      idCampaign,
      limit,
    );
  }
}
