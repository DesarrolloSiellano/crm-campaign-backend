import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMultilevelDto } from './dto/create-multilevel.dto';
import { UpdateMultilevelDto } from './dto/update-multilevel.dto';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Multilevel } from './entities/multilevel.entity';

@Injectable()
export class MultilevelService {
  constructor(
    @InjectModel('Multilevel')
    private readonly multilevelModel: Model<Multilevel>,
  ) {}
  async create(createMultilevelDto: CreateMultilevelDto) {
    console.log('createMultilevelDto', createMultilevelDto);

    try {
      createMultilevelDto.level = createMultilevelDto.level + 1;

      if (createMultilevelDto.level === 1) {
        createMultilevelDto.levelShow = '1';
      }

      if (createMultilevelDto.level === 2) {
        createMultilevelDto.levelShow = '2';
      }

      if (createMultilevelDto.level === 3) {
        createMultilevelDto.levelShow = '3';
      }

      if (createMultilevelDto.level === 4 || createMultilevelDto.level > 4) {
        createMultilevelDto.levelShow = '4';
      }

      const result = new this.multilevelModel(createMultilevelDto);
      await result.save();

      if (!result) {
        throw new NotFoundException('Multilevel not created');
      }

      return {
        message: 'Multilevel created successfully',
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

  async findAll() {
    const result = await this.multilevelModel.find();
    if (!result || result.length === 0) {
      throw new NotFoundException('No multilevel found');
    }

    return {
      message: 'Multilevel found',
      statusCode: 200,
      status: 'Success',
      data: result,
      meta: {
        totalData: result.length,
      },
    };
  }

  findOne(id: string) {
    const result = this.multilevelModel.findById(id);
    if (!result) {
      throw new NotFoundException('Multilevel not found by id');
    }
    return {
      message: 'Multilevel found',
      statusCode: 200,
      status: 'Success',
      data: result,
      meta: {
        totalData: 1,
      },
    };
  }

  async findByWhatsapp(whatsapp: string) {
    const result = await this.multilevelModel.findOne({ whatsapp });
    if (!result) {
      throw new NotFoundException('Multilevel not found by whatsapp');
    }
    return {
      message: 'Multilevel found',
      statusCode: 200,
      status: 'Success',
      data: [result],
      meta: {
        totalData: 1,
        idMultilevel: result._id,
      },
    };
  }

  async findByPage(from?: number, limit?: number, global?: any, filters?: any) {
    const query: any = {};

    // Búsqueda global en varios campos
    if (global) {
      query.$or = [
        { firstName: new RegExp(global, 'i') },
        { lastName: new RegExp(global, 'i') },
        { whatsapp: new RegExp(global, 'i') },
        { email: new RegExp(global, 'i') },
      ];
    }

    const skipNumber = from && from >= 0 ? from : 0;
    const limitNumber = limit && limit > 0 ? limit : 100;
    const leaders = await this.multilevelModel
      .find(query)
      .skip(skipNumber)
      .limit(limitNumber);
    const totalData = await this.multilevelModel.countDocuments(query);
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

  async update(id: string, updateMultilevelDto: UpdateMultilevelDto) {
    try {
      const result = await this.multilevelModel.findByIdAndUpdate(
        id,
        updateMultilevelDto,
        { new: true, runValidators: true },
      );
      if (!result) {
        throw new NotFoundException('Multilevel not found');
      }
      return {
        message: 'Multilevel updated successfully',
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
          'Duplicate key error: Multilevel already exists ' +
            JSON.stringify(error.keyValue),
        );
      }
      throw new BadRequestException(
        'Error updating multilevel: ' + error.message,
      );
    }
  }

  async remove(id: string) {
    const result = await this.multilevelModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Multilevel not found');
    }
    return {
      message: 'Multilevel deleted successfully',
      statusCode: 200,
      status: 'Success',
      data: [result],
      meta: {
        totalData: 1,
        deletedAt: new Date().toISOString(),
        id: result._id,
      },
    };
  }
}
