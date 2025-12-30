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
} from '@nestjs/common';
import { MultilevelService } from './multilevel.service';
import { CreateMultilevelDto } from './dto/create-multilevel.dto';
import { UpdateMultilevelDto } from './dto/update-multilevel.dto';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt'))
@Controller('multilevel')
export class MultilevelController {
  constructor(private readonly multilevelService: MultilevelService) {}

  @Post()
  create(@Body() createMultilevelDto: CreateMultilevelDto) {
    return this.multilevelService.create(createMultilevelDto);
  }

  @Get('/findByWhatsApp/:whatsapp')
  findByWhatsapp(@Param('whatsapp') whatsapp: string) {
    return this.multilevelService.findByWhatsapp(whatsapp);
  }

  @Get()
  findAll() {
    return this.multilevelService.findAll();
  }

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
    console.log(idParentLevel);
    

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

  @Get('findByIdParentLevel')
  findByIdParentLevel(@Query('idParentLevel') id: string) {
    return this.multilevelService.findByIdParentLevel(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.multilevelService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMultilevelDto: UpdateMultilevelDto,
  ) {
    return this.multilevelService.update(id, updateMultilevelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.multilevelService.remove(id);
  }
}
