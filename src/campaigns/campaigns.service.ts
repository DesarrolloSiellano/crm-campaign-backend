import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Campaign } from './entities/campaign.entity';
import { Model } from 'mongoose';
import moment from 'moment';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel('Campaign') private readonly campaignModel: Model<Campaign>,
  ) {}
  async create(createCampaignDto: CreateCampaignDto) {
    try {
      const result = new this.campaignModel(createCampaignDto);
      await result.save();

      if (!result) {
        return {
          message: 'Campaign not created',
          statusCode: 400,
          status: 'Error',
        };
      }

      return {
        message: 'Campaign created successfully',
        statusCode: 201,
        status: 'Success',
        data: [result],
        meta: {
          totalData: 1,
          createdAt: moment().toISOString(),
          updatedAt: moment().toISOString(),
          idCampaign: result._id,
        },
      };
    } catch (error) {
      throw new BadRequestException('Error creating Campaign: ' + error.message);
    }
  }

  async findAll() {
      const result = await this.campaignModel.find();
      if (!result || result.length === 0) {
        throw new NotFoundException('No Campaign found');
      }
      return {
        message: 'Campaign found',
        statusCode: 200,
        status: 'Success',
        data: result,
        meta: {
          totalData: result.length,
        },
      };
    }

    async findByCompany(company: string) {      
      const result = await this.campaignModel.find({ company: company });
      
      if (!result) {
        throw new NotFoundException('Campaign not found by company');
      }
      return {
        message: 'Campaign found',
        statusCode: 200,
        status: 'Success',
        data: result,
        meta: {
          totalData: 1,
        },
      };
      
    }
  
    async findOne(id: string) {
      const result = await this.campaignModel.findById(id);
      if (!result) {
        throw new NotFoundException('Campaign not found by id');
      }
      return {
        message: 'Campaigns found',
        statusCode: 200,
        status: 'Success',
        data: result,
        meta: {
          totalData: 1,
        },
      };
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
  
      const skipNumber = from && from >= 0 ? from : 0;
      const limitNumber = limit && limit > 0 ? limit : 100;
      const leaders = await this.campaignModel
        .find(query)
        .skip(skipNumber)
        .limit(limitNumber);
      const totalData = await this.campaignModel.countDocuments(query);
      return {
        statusCode: 200,
        status: 'Success',
        message: 'Campaigns found',
        data: leaders,
        meta: {
          totalData: totalData,
        },
      };
    }
  
    async update(id: string, updateCampaignDto: UpdateCampaignDto) {
      try {
        const result = await this.campaignModel.findByIdAndUpdate(
          id,
          updateCampaignDto,
          { new: true, runValidators: true },
        );
        if (!result) {
          throw new NotFoundException('Campaign not found');
        }
        if (!id) {
          throw new BadRequestException('id is required param');
        }
        return {
          message: 'Campaignç updated successfully',
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
        
        throw new BadRequestException('Error updating Campaign: ' + error.message);
      }
    }
  
    async remove(id: string) {
      try {
        const result = await this.campaignModel.findByIdAndDelete(id);
        if (!result) {
          throw new NotFoundException('Campaign not found');
        }
        if (!id) {
          throw new BadRequestException('id is required param');
        }
        
        return {
          message: 'Campaign deleted successfully',
          statusCode: 200,
          status: 'Success',
          data: [result],
          meta: {
            totalData: 1,
            deletedAt: moment().toISOString(),
            id: result._id,
          },
        };
      } catch (error) {
        throw new BadRequestException('Error deleting Campaign: ' + error.message);
      }
    }
}
