import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Campaign } from './entities/campaign.entity';
import { CampaignConfig } from './entities/campaign-config.entity';
import { Model } from 'mongoose';
import moment from 'moment';
@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel('Campaign') private readonly campaignModel: Model<Campaign>,
    @InjectModel('CampaignConfig') private readonly configModel: Model<CampaignConfig>,
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

      // Cada vez que se crea una campaña, se auto-configura como activa por defecto
      await this.setActiveCampaign(createCampaignDto.company, result._id.toString());

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
    await this.autoCloseExpiredCampaigns();
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
    await this.autoCloseExpiredCampaigns();
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

  async findByAutocomplete(autocomplete: string, company: string, status?: string) {
    await this.autoCloseExpiredCampaigns();
    const query: any = {
      company: company,
      name: new RegExp(autocomplete, 'i'),
    };
    if (status) {
      query.status = status;
    }
    
    const result = await this.campaignModel
      .find(query)
      .select('_id name status startDate endDate')
      .limit(15)
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
        totalData: result.length,
      },
    };
  }

  async findCampaignByLeader(leaderId: string) {
    await this.autoCloseExpiredCampaigns();
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
    await this.autoCloseExpiredCampaigns();
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
    await this.autoCloseExpiredCampaigns();
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

  private async autoCloseExpiredCampaigns(): Promise<void> {
    try {
      const todayStr = moment().format('YYYY-MM-DD');
      await this.campaignModel.updateMany(
        {
          status: { $ne: 'CERRADA' },
          endDate: { $lt: todayStr },
        },
        {
          $set: { status: 'CERRADA', updatedAt: todayStr },
        },
      );
    } catch (error) {
      console.error('Error auto-closing expired campaigns:', error);
    }
  }

  async setActiveCampaign(company: string, campaignId: string) {
    try {
      const config = await this.configModel.findOneAndUpdate(
        { company },
        { campaign: campaignId },
        { upsert: true, new: true, runValidators: true }
      );
      
      const campaign = await this.campaignModel.findById(campaignId).lean();
      
      return {
        message: 'Active campaign configured successfully',
        statusCode: 200,
        status: 'Success',
        data: campaign,
      };
    } catch (error) {
      throw new BadRequestException('Error setting active campaign: ' + error.message);
    }
  }

  async getActiveCampaign(company: string) {
    try {
      const config = await this.configModel.findOne({ company }).populate('campaign').lean();
      if (!config || !config.campaign) {
        // Buscar la campaña abierta o más reciente como fallback por defecto
        const firstCampaign = await this.campaignModel.findOne({ company, status: 'ABIERTA' }).sort({ createdAt: -1 }).lean();
        if (firstCampaign) {
          await this.configModel.create({ company, campaign: firstCampaign._id });
          return {
            message: 'Active campaign loaded (default)',
            statusCode: 200,
            status: 'Success',
            data: firstCampaign,
          };
        }
        throw new NotFoundException('No active campaign configured and no default campaign found');
      }
      return {
        message: 'Active campaign config loaded',
        statusCode: 200,
        status: 'Success',
        data: config.campaign,
      };
    } catch (error) {
      throw new BadRequestException('Error loading active campaign: ' + error.message);
    }
  }
}
