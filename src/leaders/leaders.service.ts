import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeaderDto } from './dto/create-leader.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leader } from './entities/leader.entity';
import { log } from 'console';

@Injectable()
export class LeadersService {
  constructor(
    @InjectModel('Leader') private readonly leaderModel: Model<Leader>,
  ) {}
  async create(createLeaderDto: CreateLeaderDto) {

    try {

      const result =  new this.leaderModel(createLeaderDto);
      await result.save();

      if (!result) {
        throw new NotFoundException('Role not created');
      }

      console.log('result', result);

      return {
        message: 'Leader created successfully',
        statusCode: 201,
        status: 'Success',
        data: [result],
        meta: {
          totalData: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: result._id,
        },
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          'Duplicate key error: Leader already exists ' +
            JSON.stringify(error.keyValue),
        );
      }
      throw new BadRequestException('Error creating leader: ' + error.message);
    }
  }

  findAll() {
    return `This action returns all leaders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} leader`;
  }

  async findByPage(from?: number, limit?: number, global?: any, filters?: any) {
  const query: any = {};

  // Búsqueda global en varios campos
  if (global) {
    query.$or = [
      { nombres: new RegExp(global, 'i') },
      { apellidos: new RegExp(global, 'i') },
      { numeroDocumento: new RegExp(global, 'i') },
      { celular: new RegExp(global, 'i') },
      { email: new RegExp(global, 'i') },
    ];
  }

  const skipNumber = (from && from >= 0) ? from : 0;
  const limitNumber = (limit && limit > 0) ? limit : 100;
  const leaders = await this.leaderModel.find(query).skip(skipNumber).limit(limitNumber);
  const totalData = await this.leaderModel.countDocuments(query);
  return {
    statusCode: 200,
    status: 'Success',
    message: 'Leaders found',
    data: leaders,
    meta: {
      totalData: totalData,
    },
  };
}


  async update(id: string, updateLeaderDto: UpdateLeaderDto) {
    
    try {
      const result = await this.leaderModel.findByIdAndUpdate(
        id,
        updateLeaderDto,
        { new: true, runValidators: true },
      );
      if (!result) {
        throw new NotFoundException('Leader not found');
      }
      if(!id) {
        throw new BadRequestException('id is required param');
      }
      return {
        message: 'Leader updated successfully',
        statusCode: 200,
        status: 'Success',
        data: [result],
        meta: {
          totalData: 1,
          updatedAt: new Date().toISOString(),
          id: result._id,
        },
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          'Duplicate key error: Leader already exists ' +
            JSON.stringify(error.keyValue),
        );
      }
      throw new BadRequestException('Error updating leader: ' + error.message);
    }
  }

  async remove(id: string) {
    console.log('id', id);
    
    try {
      const result = await this.leaderModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException('Leader not found');
      }
      if(!id) {
        throw new BadRequestException('id is required param');
      }
      return {
        message: 'Leader deleted successfully',
        statusCode: 200,
        status: 'Success',
        data: [result],
        meta: {
          totalData: 1,
          deletedAt: new Date().toISOString(),
          id: result._id,
        },
      };
    } catch (error) {
      throw new BadRequestException('Error deleting leader: ' + error.message);
    }
  }
}

