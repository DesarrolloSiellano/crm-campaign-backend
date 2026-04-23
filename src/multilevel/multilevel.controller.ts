import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UnauthorizedException,
  Req,
  UseGuards,
  ParseArrayPipe,
} from '@nestjs/common';
import { MultilevelService } from './multilevel.service';
import { CreateMultilevelDto } from './dto/create-multilevel.dto';
import { UpdateMultilevelDto } from './dto/update-multilevel.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('multilevel')
export class MultilevelController {
  constructor(private readonly multilevelService: MultilevelService) { }

  @Post()
  create(@Body() createMultilevelDto: CreateMultilevelDto) {
    return this.multilevelService.create(createMultilevelDto);
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('findByGeo')
  findByGeo(
    @Req() req: any,
    @Query('department') department: string,
    @Query('city') city: string,
    @Query('campaign') campaign: string,
    @Query('idParentLevel') idParentLevel: string,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }

    return this.multilevelService.findByGeo(
      department,
      city,
      campaign,
      user.company,
      idParentLevel
    );
  }


  @Get('/findByWhatsApps')
  findByWhatsapps(
    @Query('whatsapps', new ParseArrayPipe({ items: String, separator: ',' }))
    whatsapps: string[],
  ) {
    return this.multilevelService.findByWhatsapps(whatsapps);
  }

  @Get('/findByEmails')
  findByEmails(
    @Query('emails', new ParseArrayPipe({ items: String, separator: ',' }))
    emails: string[],
  ) {
    return this.multilevelService.findByEmails(emails);
  }

  @Get('/findByWhatsApp/:whatsapp')
  findByWhatsapp(@Param('whatsapp') whatsapp: string) {
    return this.multilevelService.findByWhatsapp(whatsapp);
  }

  @Get('/findByEmail/:email')
  findByEmail(@Param('email') email: string) {
    return this.multilevelService.findByEmail(email);
  }



  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.multilevelService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('findByPage')
  findByPage(
    @Req() req: any,
    @Query('from') from?: number,
    @Query('limite') limite?: number,
    @Query('global') global?: string,
    @Query('filters') filters?: string,
    @Query('idParentLevel') idParentLevel?: any,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }

    // Convierte from y limite a número, o usa valores por defecto
    const fromNumber = from !== undefined ? Number(from) : 0;
    const limiteNumber = limite !== undefined ? Number(limite) : 10;
    return this.multilevelService.findByPage(
      fromNumber,
      limiteNumber,
      global,
      filters,
      idParentLevel,
      user.company,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('findByIdParentLevel')
  findByIdParentLevel(@Query('idParentLevel') id: string) {
    return this.multilevelService.findByIdParentLevel(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.multilevelService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMultilevelDto: UpdateMultilevelDto,
  ) {
    return this.multilevelService.update(id, updateMultilevelDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.multilevelService.remove(id);
  }
}
