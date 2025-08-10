import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PopulationService } from './population.service';
import { CreatePopulationDto } from './dto/create-population.dto';
import { UpdatePopulationDto } from './dto/update-population.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('population')
export class PopulationController {
  constructor(private readonly populationService: PopulationService) {}

  @Post()
  create(@Body() createPopulationDto: CreatePopulationDto) {
    return this.populationService.create(createPopulationDto);
  }

  @Get()
  findAll() {
    return this.populationService.findAll();
  }

  @Get(':document')
  @ApiOperation({ summary: 'Obtener una persona por Documento' })
  @ApiParam({ name: 'document', description: 'número de documento de la persona' })
  @ApiResponse({
    status: 200,
    description: 'Persona encontrado',
    schema: {
      example: {
        message: 'Person found',
        statusCode: 200,
        status: 'Success',
        data: {
          /* objeto módulo */
        },
        meta: { totalData: 1 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Persona no encontrada',
  })
  findByDocument(@Param('document') document: string) {
    return this.populationService.findByDocument( document);
  }

  @Get('findByQueryWorld/:world')
  @ApiOperation({ summary: 'Obtener una persona por Documento' })
  @ApiParam({ name: 'world', description: 'Texto o palabra de la consulta' })
  @ApiResponse({
    status: 200,
    description: 'Persona encontrado',
    schema: {
      example: {
        message: 'Person found',
        statusCode: 200,
        status: 'Success',
        data: {
          /* objeto módulo */
        },
        meta: { totalData: 1 },
      },
    },
  })
  findByQueryWorld( @Param('world') world: string) {
    return this.populationService.findByQueryWorld(world);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.populationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePopulationDto: UpdatePopulationDto) {
    return this.populationService.update(+id, updatePopulationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.populationService.remove(+id);
  }
}
