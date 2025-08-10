import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePopulationDto } from './dto/create-population.dto';
import { UpdatePopulationDto } from './dto/update-population.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Population } from './entities/population.entity';
import { Model } from 'mongoose';


@Injectable()
export class PopulationService {

  constructor(@InjectModel('Population') private readonly populationModel: Model<Population>) {}
  create(createPopulationDto: CreatePopulationDto) {
    return 'This action adds a new population';
  }

  findAll() {
    return `This action returns all population`;
  }
  async findByDocument(document: string) {
    const population = await this.populationModel.find({numeroDocumento: document});
    if (!population || population.length === 0) {
      throw new NotFoundException('No person found');
    }
    if(!document) {
      throw new BadRequestException('numeroDocumento is required param');
    }
    return {
      message: 'Person found',
      statusCode: 200,
      status: 'Success',
      data: population,
      meta: {
        totalData: 1
      }
    };
  }
  
  async findByQueryWorld(world: string) {
  if (!world) {
    throw new BadRequestException('Search term is required');
  }

  // Quitar espacios dentro de la palabra
  const term = world.replace(/\s+/g, '');

  // Consulta solo con un término, sin dividir en palabras
  const query = {
    $or: [
      { telefono: new RegExp(term, 'i') },
      { tel: new RegExp(term, 'i') },
      { email: new RegExp(term, 'i') },
      { numeroDocumento: new RegExp(term, 'i') },
    ]
  };

  const population = await this.populationModel.findOne(query);

  if (!population) {
    throw new NotFoundException('No person found');
  }

  return {
    message: 'Person found',
    statusCode: 200,
    status: 'Success',
    data: [population],
    meta: {
      totalData: 1
    }
  };
}




  findOne(id: number) {
    return `This action returns a #${id} population`;
  }

  update(id: number, updatePopulationDto: UpdatePopulationDto) {
    return `This action updates a #${id} population`;
  }

  remove(id: number) {
    return `This action removes a #${id} population`;
  }
}
