import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LeadersService } from './leaders.service';
import { CreateLeaderDto } from './dto/create-leader.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { UpdateCampaignDto } from 'src/campaigns/dto/update-campaign.dto';
import { FileInterceptor } from '@nestjs/platform-express';

//TODO: organizar la documentacion swagger
@UseGuards(JwtAuthGuard)
@Controller('leaders')
export class LeadersController {
  constructor(private readonly leadersService: LeadersService) { }

  @Post()
  create(@Body() createLeaderDto: CreateLeaderDto) {
    return this.leadersService.create(createLeaderDto);
  }

  @Post('updateCampaign')
  updateCampaign(
    @Query('company') company: string,
    @Body() campaign: UpdateCampaignDto,
  ) {
    return this.leadersService.updateCampaign(company, campaign);
  }

  @Post('updateCampaignByLeader')
  updateCampaignByLeader(
    @Query('id') id: string,
    @Body() campaign: UpdateCampaignDto,
  ) {
    return this.leadersService.updateCampaignByLeader(id, campaign);
  }

  @Post('updateProfilePhoto')
  @UseInterceptors(FileInterceptor('photo')) // Sin validaciones
  async updateProfilePhoto(
    @UploadedFile() file: Express.Multer.File,
    @Query('id') id: string,
  ) {
    return this.leadersService.updateProfilePhoto(id, file);
  }

  @Get()
  findAll() {
    return this.leadersService.findAll();
  }

  @Get('findByGeo')
  findByGeo(
    @Req() req: any,
    @Query('department') department: string,
    @Query('city') city: string,
    @Query('campaign') campaign: string,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }

    return this.leadersService.findByGeo(
      department,
      city,
      campaign,
      user.company,
    );
  }

  @Get('findByEmail')
  findByEmail(@Req() req: any) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }
    return this.leadersService.findByEmail(user.email);
  }

  @Get('findAllLeaders')
  findAllLeaders(
    @Req() req: any,
    @Query('idCampaign') idCampaign: string,
    @Query('query') query: string,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }

    return this.leadersService.findAllLeaders(idCampaign, query);
  }

  @Get('findById/:id')
  findOne(@Param('id') id: string) {
    return this.leadersService.findOne(id);
  }

  @Get('findByPage')
  findByPage(
    @Req() req: any,
    @Query('from') from?: number,
    @Query('limite') limite?: number,
    @Query('global') global?: string,
    @Query('filters') filters?: string,
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
    return this.leadersService.findByPage(
      fromNumber,
      limiteNumber,
      global,
      filters,
      user.company
    );
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateLeaderDto: UpdateLeaderDto) {
    return this.leadersService.update(id, updateLeaderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadersService.remove(id);
  }
}
