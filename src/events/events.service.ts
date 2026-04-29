import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { Multilevel } from 'src/multilevel/entities/multilevel.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel('Event') private readonly eventModel: Model<Event>,
    @InjectModel('Multilevel') private readonly multilevelModel: Model<Multilevel>,
  ) { }

  async create(createEventDto: CreateEventDto) {
    try {
      const result = new this.eventModel(createEventDto);
      await result.save();

      return {
        message: 'Evento creado exitosamente',
        statusCode: 201,
        status: 'Success',
        data: [result],
        meta: { totalData: 1 },
      };
    } catch (error) {
      throw new BadRequestException('Error al crear el evento: ' + error.message);
    }
  }

  async findAll() {
    const result = await this.eventModel.find();
    return {
      message: 'Eventos encontrados',
      statusCode: 200,
      status: 'Success',
      data: result,
      meta: { totalData: result.length },
    };
  }

  async findOne(id: string) {
    const result = await this.eventModel.findById(id);
    if (!result) throw new NotFoundException('Evento no encontrado');
    return {
      message: 'Evento encontrado',
      statusCode: 200,
      status: 'Success',
      data: [result],
      meta: { totalData: 1 },
    };
  }

  /**
   * Encuentra todos los eventos para un usuario específico basándose en su jerarquía.
   * Un usuario ve eventos asignados a:
   * 1. Él mismo (su idInvited/Multilevel _id)
   * 2. Cualquier ancestro directo en la red multinivel (idParentLevel recursivo)
   */
  async findAllForUser(userId: string) {
    try {
      // 1. Obtener la jerarquía de ancestros del usuario
      // Usamos agregación para encontrar todos los IDs superiores
      const hierarchy = await this.multilevelModel.aggregate([
        { $match: { _id: new Types.ObjectId(userId) } },
        {
          $graphLookup: {
            from: 'multilevels', // Mongoose pluraliza 'Multilevel'
            startWith: '$idParentLevel',
            connectFromField: 'idParentLevel',
            connectToField: 'idInvited', // En este proyecto idInvited parece ser el ID único del nodo
            as: 'ancestors',
          },
        },
        {
          $project: {
            allAssignerIds: {
              $concatArrays: [
                ['$_id'],
                ['$idInvited'],
                ['$idParentLevel'],
                { $map: { input: '$ancestors', as: 'a', in: '$$a.idInvited' } },
                { $map: { input: '$ancestors', as: 'a', in: '$$a._id' } }
              ]
            }
          }
        }
      ]);

      if (!hierarchy || hierarchy.length === 0) {
        throw new NotFoundException('Usuario no encontrado en la red multinivel');
      }

      // Limpiar IDs nulos y duplicados (convertir a strings para comparación)
      const assignerIds = [...new Set(hierarchy[0].allAssignerIds
        .filter((id: any) => id)
        .map((id: any) => id.toString())
      )];

      // 2. Buscar eventos asignados a cualquiera de esos IDs
      const events = await this.eventModel.find({
        assignedLeaderIds: { $in: assignerIds },
        status: 'PROGRAMADO'
      });

      return {
        message: 'Eventos jerárquicos encontrados',
        statusCode: 200,
        status: 'Success',
        data: events,
        meta: { totalData: events.length },
      };
    } catch (error) {
      throw new BadRequestException('Error al obtener eventos jerárquicos: ' + error.message);
    }
  }


  async findByPage(from?: number, limit?: number, global?: any, filters?: any, company?: string, idUser?: string, idCampaign?: string) {
    const query: any = {
      company: company
    };

    if (idUser) {
      query.idUserCreation = idUser;
    }

    if (idCampaign) {
      query['campaign._id'] = idCampaign;
    }


    // Búsqueda global en varios campos
    if (global) {
      query.$or = [
        { title: new RegExp(global, 'i') },
      ];
    }

    const skipNumber = from && from >= 0 ? from : 0;
    const limitNumber = limit && limit > 0 ? limit : 100;
    const events = await this.eventModel
      .find(query)
      .skip(skipNumber)
      .limit(limitNumber);
    const totalData = await this.eventModel.countDocuments(query);
    return {
      statusCode: 200,
      status: 'Success',
      message: 'Events found',
      data: events,
      meta: {
        totalData: totalData,
      },
    };
  }

  async findByDateRange(startDate: string, endDate: string, company: string, idCampaign?: string) {
    const query: any = {
      company: company,
      date: { $gte: startDate, $lte: endDate }
    };

    if (idCampaign) {
      query['campaign._id'] = idCampaign;
    }

    const events = await this.eventModel.find(query).sort({ date: 1, startTime: 1 });

    return {
      statusCode: 200,
      status: 'Success',
      message: 'Events found for calendar range',
      data: events,
      meta: {
        totalData: events.length,
      },
    };
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    try {
      const result = await this.eventModel.findByIdAndUpdate(id, updateEventDto, { new: true, runValidators: true });
      if (!result) throw new NotFoundException('Evento no encontrado');
      return {
        message: 'Evento actualizado exitosamente',
        statusCode: 200,
        status: 'Success',
        data: [result],
        meta: { totalData: 1 },
      };
    } catch (error) {
      throw new BadRequestException('Error al actualizar el evento: ' + error.message);
    }
  }

  async toggleAttendance(id: string, attendanceDto: { attendeeId: string, fullName: string, email: string, phone: string, role: string, status: boolean }) {
    try {
      const { attendeeId, fullName, email, phone, role, status } = attendanceDto;

      const update = status
        ? { $addToSet: { attendance: { attendeeId, fullName, email, phone, role, checkIn: new Date() } } }
        : { $pull: { attendance: { attendeeId: attendeeId } } };

      const result = await this.eventModel.findByIdAndUpdate(id, update, { new: true });

      if (!result) throw new NotFoundException('Evento no encontrado');

      return {
        message: status ? 'Asistencia marcada' : 'Asistencia removida',
        statusCode: 200,
        status: 'Success',
        data: [result],
        meta: { totalData: 1 },
      };
    } catch (error) {
      throw new BadRequestException('Error al actualizar asistencia: ' + error.message);
    }
  }

  async remove(id: string) {
    const result = await this.eventModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Evento no encontrado');
    return {
      message: 'Evento eliminado exitosamente',
      statusCode: 200,
      status: 'Success',
      data: [result],
      meta: { totalData: 1 },
    };
  }
}
