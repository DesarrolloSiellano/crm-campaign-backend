import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeaderDto } from './dto/create-leader.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leader } from './entities/leader.entity';
import { Multilevel } from 'src/multilevel/entities/multilevel.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as generatePassword from 'generate-password';
import { ROLES } from './helpers/roles';
import { PERMISSIONS } from './helpers/permissions';
import { MODULES } from './helpers/modules';
import { UpdateCampaignDto } from 'src/campaigns/dto/update-campaign.dto';
import { Campaign } from '../campaigns/entities/campaign.entity';

@Injectable()
export class LeadersService {
  constructor(
    @InjectModel('Leader') private readonly leaderModel: Model<Leader>,
    @InjectModel('Campaign') private readonly campaignModel: Model<Campaign>,
    @InjectModel('Multilevel')
    private readonly multilevelModel: Model<Multilevel>,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}
  async create(createLeaderDto: CreateLeaderDto) {
    try {
      const result = new this.leaderModel(createLeaderDto);
      await result.save();

      if (!result) {
        throw new NotFoundException('Leader not created');
      }

      const multilevelData = {
        idInvited: result._id,
        idParentLevel: result._id,
        levelShow: '1',
        profile: `Lider ${result.tipoLider}`,
        level: 1,
        actived: true,
        firstName: result.nombres,
        lastName: result.apellidos,
        whatsapp: result.celular,
        policy: true,
        conditions: true,
        company: createLeaderDto.company,
      };

      const resultMultilevel = new this.multilevelModel(multilevelData);
      await resultMultilevel.save();

      let response = {};

      if (resultMultilevel) {
        response = {
          message: 'Leader created successfully',
          statusCode: 201,
          status: 'Success',
          data: [result],
          meta: {
            totalData: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            idLeader: result._id,
            idMultilevel: resultMultilevel._id,
            multilevelMessage: 'Multilevel created successfully',
            multilevel: resultMultilevel,
          },
        };
      } else {
        response = {
          message: 'Leader created successfully',
          statusCode: 207,
          status: 'Partial Success',
          data: [result],
          meta: {
            totalData: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            idLeader: result._id,
            idMultilevel: null,
            multilevelMessage: 'Multilevel not created',
            multilevel: null,
          },
        };
      }

      const tempPassword = generatePassword.generate({
        length: 12,
        numbers: true,
        uppercase: true,
        symbols: true,
        strict: true,
      });

      const userPayload = {
        name: result.nombres,
        lastName: result.apellidos,
        email: result.email,
        phone: result.celular,
        password: tempPassword,
        role: ROLES,
        permissions: PERMISSIONS,
        modules: MODULES,
        company: createLeaderDto.company || 'default_company',
        isActived: true,
        isAdmin: false,
        isSuperAdmin: false,
        isNewUser: true,
      };

      const userResponse = await firstValueFrom(
        this.userClient.send({ cmd: 'createUser' }, userPayload),
      );


      if (userResponse.statusCode === 201 || userResponse.statusCode === 200) {
        {
          response = {
            message: 'Leader created successfully',
            statusCode: 201,
            status: 'Success',
            data: [result],
            meta: {
              totalData: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              idLeader: result._id,
              idMultilevel: resultMultilevel._id,
              multilevelMessage: 'Multilevel created successfully',
              multilevel: resultMultilevel,
              userMessage: 'User created successfully',
              user: userResponse,
            },
          };
        }
      }

      return response;
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

  async updateCampaign(company: string, campaign: UpdateCampaignDto) {
    try {
      const campaignResult = await this.campaignModel.findById(campaign._id);

      if (!campaignResult) {
        throw new NotFoundException('Campaign not found');
      }

      if (campaignResult.status === 'CERRADA') {
        throw new BadRequestException('No se puede actualizar porque la campaña está cerrada');
      }
      // Actualiza todos los líderes de la compañía con la campaña
      const result = await this.leaderModel.updateMany(
        { company: company }, // Filtro: líderes de esa compañía
        { $set: { campaign: campaign } }, // Actualización: asignar la campaña completa u objeto
        { runValidators: true },
      );

      // Si no se modificó ningún documento
      if (result.matchedCount === 0) {
        throw new NotFoundException('No leaders found for this company');
      }

      return {
        message: 'Leaders configured successfully',
        statusCode: 200,
        status: 'Success',
        data: {
          matched: result.matchedCount,
          modified: result.modifiedCount,
        },
        meta: {
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new BadRequestException('Error updating Leaders: ' + error.message);
    }
  }
  async updateCampaignByLeader(_id: string, campaign: UpdateCampaignDto) {


    try {
      const campaignResult = await this.campaignModel.findById(campaign._id);

      if (!campaignResult) {
        throw new NotFoundException('Campaign not found');
      }

       if (campaignResult.status === 'CERRADA') {
        throw new BadRequestException('No se puede actualizar porque la campaña está cerrada');

      }

      const result = await this.leaderModel.findByIdAndUpdate(
        _id, // ID del líder a actualizar
        { $set: { campaign } }, // Asigna directamente la campaña enviada
        {
          new: true, // Devuelve el documento actualizado
          runValidators: true, // Aplica validaciones del schema
        },
      );

      if (!result) {
        throw new NotFoundException('Leader not found');
      }

      return {
        message: 'Leader campaign updated successfully',
        statusCode: 200,
        status: 'Success',
        data: result,
        meta: {
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Error updating leader campaign: ' + error.message,
      );
    }
  }

  async findAll() {
    const result = await this.leaderModel.find();
    if (!result || result.length === 0) {
      throw new NotFoundException('No leader found');
    }
    return {
      message: 'Leaders found',
      statusCode: 200,
      status: 'Success',
      data: result,
      meta: {
        totalData: result.length,
      },
    };
  }

  async findOne(id: number) {
    const result = await this.leaderModel.findById(id);
    if (!result) {
      throw new NotFoundException('Leader not found by id');
    }
    return {
      message: 'Leader found',
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
    const leaders = await this.leaderModel
      .find(query)
      .skip(skipNumber)
      .limit(limitNumber);
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
      if (!id) {
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
    try {
      const result = await this.leaderModel.findByIdAndDelete(id);
      const resultMultilevel = await this.multilevelModel.findOneAndDelete({
        idInvited: id,
        idParentLevel: id,
      });
      if (!result) {
        throw new NotFoundException('Leader not found');
      }
      if (!id) {
        throw new BadRequestException('id is required param');
      }

      let response = {};

      if (resultMultilevel) {
        response = {
          message: 'Leader deleted successfully',
          statusCode: 200,
          status: 'Success',
          data: [result],
          meta: {
            totalData: 1,
            deletedAt: new Date().toISOString(),
            id: result._id,
            idMultilevel: resultMultilevel._id,
            multilevel: resultMultilevel,
          },
        };
      } else {
        response = {
          message: 'Leader deleted successfully but not deleted multilevel',
          statusCode: 200,
          status: 'Success',
          data: [result],
          meta: {
            totalData: 1,
            deletedAt: new Date().toISOString(),
            id: result._id,
            idMultilevel: null,
            multilevel: null,
          },
        };
      }
      return response;
    } catch (error) {
      throw new BadRequestException('Error deleting leader: ' + error.message);
    }
  }
}
