import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      throw new BadRequestException(
        'Error creating Campaign: ' + error.message,
      );
    }
  }

  async findAll() {
    const result = await this.campaignModel.find().lean();
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
    const result = await this.campaignModel.find({ company: company }).lean();

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

  async findByAutocomplete(autocomplete: string, company: string) {
    const result = await this.campaignModel
      .find({
        company: company,
        name: new RegExp(autocomplete, 'i'),
        status: 'ABIERTA',
      })
      .lean();
    if (!result) {
      throw new NotFoundException('Campaign not found by name');
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

  async findCampaignByLeader(leaderId: string) {
    const campaign = await this.campaignModel
      .findOne({
        status: 'ABIERTA',
        lideres: leaderId,
      })
      .populate('lideres')
      .lean();

    if (!campaign) {
      throw new NotFoundException('No open campaign found for this leader');
    }

    return {
      message: 'Campaign found',
      statusCode: 200,
      status: 'Success',
      data: campaign,
      meta: { totalData: 1 },
    };
  }

  async findOne(id: string) {
    const result = await this.campaignModel.findById(id).lean();
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

  async findByPage(
    from?: number,
    limit?: number,
    global?: any,
    filters?: any,
    company?: string,
  ) {
    const query: any = {
      company: company,
    };

    // Búsqueda global en varios campos
    if (global) {
      query.$or = [
        { name: new RegExp(global, 'i') },
        { company: new RegExp(global, 'i') },
        { description: new RegExp(global, 'i') },
        { status: new RegExp(global, 'i') },
        { startDate: new RegExp(global, 'i') },
        { endDate: new RegExp(global, 'i') },
      ];
    }

    const skipNumber = from && from >= 0 ? from : 0;
    const limitNumber = limit && limit > 0 ? limit : 100;
    const leaders = await this.campaignModel
      .find(query)
      .skip(skipNumber)
      .limit(limitNumber)
      .lean();
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
        { new: true, runValidators: true, lean: true },
      );
      if (!result) {
        throw new NotFoundException('Campaign not found');
      }
      if (!id) {
        throw new BadRequestException('id is required param');
      }
      return {
        message: 'Campaign updated successfully',
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
      throw new BadRequestException(
        'Error updating Campaign: ' + error.message,
      );
    }
  }

  async remove(id: string) {
    try {
      const result = await this.campaignModel.findByIdAndDelete(id).lean();
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
      throw new BadRequestException(
        'Error deleting Campaign: ' + error.message,
      );
    }
  }
}
