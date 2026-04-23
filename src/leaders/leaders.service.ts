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
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LeadersService {
  private http = new HttpService();
  private readonly STORAGE_API_URL: string;
  constructor(
    @InjectModel('Leader') private readonly leaderModel: Model<Leader>,
    @InjectModel('Campaign') private readonly campaignModel: Model<Campaign>,
    @InjectModel('Multilevel')
    private readonly multilevelModel: Model<Multilevel>,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private configService: ConfigService
  ) {
    this.STORAGE_API_URL = this.configService.get('DOCUMENT_STORAGE_API')!;
  }

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
        email: result.email,
        policy: true,
        conditions: true,
        company: createLeaderDto.company,
        campaign: createLeaderDto.campaign,
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

      const userPayload = {
        _id: result._id,
        name: result.nombres,
        lastName: result.apellidos,
        email: result.email,
        phone: result.celular,
        redirectUri: createLeaderDto.redirectUri || null,
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
        throw new BadRequestException(
          'No se puede actualizar porque la campaña está cerrada',
        );
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
        throw new BadRequestException(
          'No se puede actualizar porque la campaña está cerrada',
        );
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

  async findOne(id: string) {
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

  async findByEmail(email: string) {
    const result = await this.leaderModel.findOne({ email: email });
    if (!result) {
      throw new NotFoundException('Leader not found by email');
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

  async findByPage(from?: number, limit?: number, global?: any, filters?: any, company?: string) {
    const query: any = {
      company: company
    };

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

  async findByGeo(
    department: string,
    city: string,
    campaign: string,
    company: string,
  ) {
    let query: any = {};

    if (company) {
      query = { company: company, 'campaign.name': campaign };
    }

    if (department) {
      query.departamento = department;
    }

    if (city) {
      query.ciudad = city;
    }


    const results = await this.leaderModel.find(query);

    // Mapear solo los campos deseados y concatenar nombre completo
    const data = results.map((geo: any) => ({
      lat: geo.lat,
      lng: geo.lng,
      nombre: `${geo.nombres} ${geo.apellidos}`.trim(), // <-- así creas 'nombre'
    }));

    if (!results || results.length === 0) {
      throw new NotFoundException('No leaders found for the given location');
    }

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Leaders found by geographic location',
      data,
      meta: {
        totalData: data.length,
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

      const deleteFoto = await this.deleteProfileFoto(result?.uuidFoto || '');
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
            deleteImgProfile: deleteFoto,
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

  async updateProfilePhoto(
    id: string,
    file: Express.Multer.File,
  ): Promise<any> {
    // 1. Reenviar archivo a API externa (documentstorate)
    const externalResponse = await this.forwardToExternalAPI(file);
    // 2. Guardar solo la URL en MongoDB
    const result = await this.leaderModel.findByIdAndUpdate(
      id,
      {
        urlFoto: externalResponse[0].url, // URL devuelta por API externa
        originalNameFoto: externalResponse[0].original_filename,
        uuidFoto: externalResponse[0].uuid,
      },
      { new: true },
    );

    return {
      message: 'Leaders foto upload successfully',
      statusCode: 200,
      status: 'Success',
      data: [result],
      meta: {
        updatedAt: new Date().toISOString(),
        urlFoto: externalResponse[0].url, // URL devuelta por API externa
        originalNameFoto: externalResponse[0].originalName,
      },
    };
  }


  async deleteProfileFoto(uuid: string) {
    const response = await firstValueFrom(
      this.http.delete(
        `${this.STORAGE_API_URL}/images/${uuid}`,
      ),
    );

    return response.data
  }

  private async forwardToExternalAPI(file: Express.Multer.File): Promise<any> {
    const formData = new FormData();
    const uint8Array = new Uint8Array(file.buffer);
    const blob = new Blob([uint8Array], {
      type: file.mimetype || 'application/octet-stream',
    });

    formData.append('images', blob, file.originalname);

    const response = await firstValueFrom(
      this.http.post(
        `${this.STORAGE_API_URL}/upload-images`,
        formData,
      ),
    );

    return response.data; // { url: "https://cdn.documentstorate.com/xxx.jpg" }
  }
}
