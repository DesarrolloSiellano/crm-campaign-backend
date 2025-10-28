import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseGuards, Req } from '@nestjs/common';
import { LeadersService } from './leaders.service';
import { CreateLeaderDto } from './dto/create-leader.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateCampaignDto } from 'src/campaigns/dto/create-campaign.dto';
import { UpdateCampaignDto } from 'src/campaigns/dto/update-campaign.dto';

//TODO: organizar la documentacion swagger
@UseGuards(AuthGuard('jwt'))
@Controller('leaders')
export class LeadersController {
  constructor(private readonly leadersService: LeadersService) {}

  @Post()
  create(@Body() createLeaderDto: CreateLeaderDto) {
    return this.leadersService.create(createLeaderDto);
  }

  @Post('updateCampaign')
  updateCampaign(@Query('company') company: string, @Body() campaign: UpdateCampaignDto) {
    return this.leadersService.updateCampaign(company, campaign);
  }

  @Post('updateCampaignByLeader')
  updateCampaignByLeader(@Query('id') id: string, @Body() campaign: UpdateCampaignDto) {
    return this.leadersService.updateCampaignByLeader(id, campaign);
  }

  @Get()
  findAll() {

    return this.leadersService.findAll();
  }

  @Get('findById/:id')
  findOne(@Param('id') id: string) {
    return this.leadersService.findOne(+id);
  }

  @Get('findByPage')
  findByPage(
    @Query('from') from?: number,
    @Query('limite') limite?: number,
    @Query('global') global?: string,
    @Query('filters') filters?: string,
  ) {

    // Convierte from y limite a número, o usa valores por defecto
    const fromNumber = from !== undefined ? Number(from) : 0;
    const limiteNumber = limite !== undefined ? Number(limite) : 10;
    return this.leadersService.findByPage(fromNumber, limiteNumber, global, filters);
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
