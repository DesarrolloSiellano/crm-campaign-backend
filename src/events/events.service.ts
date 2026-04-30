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
      // Sanitizar assignedLeaderIds para guardar solo los IDs
      if (createEventDto.assignedLeaderIds) {
        createEventDto.assignedLeaderIds = createEventDto.assignedLeaderIds.map((item: any) =>
          typeof item === 'object' ? item._id : item
        );
      }

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
   * Obtiene la lista de asistentes (Líderes + Seguidores) de forma dinámica y paginada.
   * Los seguidores se obtienen en tiempo real de la colección multilevels.
   */
  async getAttendanceList(eventId: string, page: number = 0, limit: number = 100, globalFilter?: string) {
    try {
      const event = await this.eventModel.findById(eventId);
      if (!event) throw new NotFoundException('Evento no encontrado');

      const leaderIds = event.assignedLeaderIds.map(id => new Types.ObjectId(id));
      const attendedIds = event.attendance?.map(a => a.attendeeId) || [];

      // Query para buscar líderes y sus seguidores
      const matchQuery: any = {
        $or: [
          { _id: { $in: leaderIds } },
          { idParentLevel: { $in: leaderIds } }
        ]
      };

      // Filtro global si existe
      if (globalFilter) {
        matchQuery.$and = [
          {
            $or: [
              { firstName: new RegExp(globalFilter, 'i') },
              { lastName: new RegExp(globalFilter, 'i') },
              { email: new RegExp(globalFilter, 'i') },
              { whatsapp: new RegExp(globalFilter, 'i') }
            ]
          }
        ];
      }

      const totalCount = await this.multilevelModel.countDocuments(matchQuery);

      const attendees = await this.multilevelModel.aggregate([
        { $match: matchQuery },
        {
          $project: {
            _id: 1,
            fullName: { $concat: ['$firstName', ' ', '$lastName'] },
            email: 1,
            phone: '$whatsapp',
            profile: 1,
            idParentLevel: 1
          }
        },
        { $sort: { fullName: 1 } },
        { $skip: page * limit },
        { $limit: limit }
      ]);

      const data = attendees.map(person => {
        const profile = person.profile || 'Seguidor';
        const isLeader = /^L[íi]der/i.test(profile);
        
        return {
          id: person._id.toString(),
          fullName: person.fullName,
          email: person.email,
          phone: person.phone,
          role: profile,
          severity: isLeader ? 'info' : 'success',
          attended: attendedIds.includes(person._id.toString())
        };
      });

      return {
        message: 'Lista de asistentes cargada dinámicamente',
        statusCode: 200,
        status: 'Success',
        data,
        meta: {
          totalData: totalCount,
          capacity: event.capacity,
          currentlyAttended: attendedIds.length
        },
      };
    } catch (error) {
      throw new BadRequestException('Error al cargar lista de asistencia: ' + error.message);
    }
  }

  /**
   * Encuentra todos los eventos para un usuario específico basándose en su jerarquía.
   */
  async findAllForUser(userId: string) {
    try {
      const hierarchy = await this.multilevelModel.aggregate([
        { $match: { _id: new Types.ObjectId(userId) } },
        {
          $graphLookup: {
            from: 'multilevels',
            startWith: '$idParentLevel',
            connectFromField: 'idParentLevel',
            connectToField: 'idInvited',
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

      const assignerIds = [...new Set(hierarchy[0].allAssignerIds
        .filter((id: any) => id)
        .map((id: any) => id.toString())
      )];

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
      // Sanitizar assignedLeaderIds para guardar solo los IDs
      if (updateEventDto.assignedLeaderIds) {
        updateEventDto.assignedLeaderIds = updateEventDto.assignedLeaderIds.map((item: any) =>
          typeof item === 'object' ? item._id : item
        );
      }

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

  async toggleAttendance(id: string, attendanceDto: { attendeeId: string, fullName?: string, email?: string, phone?: string, role?: string, status: boolean }) {
    try {
      let { attendeeId, fullName, email, phone, role, status } = attendanceDto;

      const event = await this.eventModel.findById(id);
      if (!event) throw new NotFoundException('Evento no encontrado');

      // Si se intenta marcar asistencia (status: true)
      if (status) {
        // 1. Verificar aforo (solo si capacity > 0)
        const currentAttendance = event.attendance?.length || 0;
        if (event.capacity > 0 && currentAttendance >= event.capacity) {
          throw new BadRequestException(`Aforo completo. Capacidad máxima: ${event.capacity} personas.`);
        }

        // 2. Buscar a la persona en multilevels para validar jerarquía y obtener datos
        const personFound = await this.multilevelModel.findById(attendeeId);
        if (!personFound) throw new NotFoundException('La persona no existe en la red multinivel');
        const person = personFound as any;

        // 3. VALIDACIÓN DE JERARQUÍA: ¿Es líder asignado o seguidor de un líder asignado?
        const isAssignedLeader = event.assignedLeaderIds.includes(person._id.toString());
        const isFollowerOfAssignedLeader = person.idParentLevel && event.assignedLeaderIds.includes(person.idParentLevel.toString());

        if (!isAssignedLeader && !isFollowerOfAssignedLeader) {
          throw new BadRequestException('Esta persona no está asignada ni es seguidora de los líderes de este evento.');
        }

        // Si faltan datos (escaneo QR), completarlos
        if (!fullName || !role) {
          fullName = `${person.firstName} ${person.lastName}`;
          email = person.email;
          phone = person.whatsapp;
          role = person.profile || 'Seguidor';
        }

        // 4. Verificar si ya está registrado
        const alreadyAttended = event.attendance?.some(a => a.attendeeId === attendeeId);
        if (alreadyAttended) {
          return {
            message: 'Asistencia ya registrada anteriormente',
            statusCode: 200,
            status: 'Warning',
            data: [event],
            meta: { 
              totalData: 1,
              currentlyAttended: event.attendance?.length || 0,
              capacity: event.capacity
            },
          };
        }

        const update = { $addToSet: { attendance: { attendeeId, fullName, email, phone, role, checkIn: new Date() } } };
        const result = await this.eventModel.findByIdAndUpdate(id, update, { new: true });
        if (!result) throw new NotFoundException('Evento no encontrado');

        return {
          message: 'Asistencia marcada',
          statusCode: 200,
          status: 'Success',
          data: [result],
          meta: { 
            totalData: 1,
            currentlyAttended: result.attendance?.length || 0,
            capacity: result.capacity
          },
        };
      } else {
        // Desmarcar asistencia
        const update = { $pull: { attendance: { attendeeId: attendeeId } } };
        const result = await this.eventModel.findByIdAndUpdate(id, update, { new: true });
        if (!result) throw new NotFoundException('Evento no encontrado');

        return {
          message: 'Asistencia removida',
          statusCode: 200,
          status: 'Success',
          data: [result],
          meta: { 
            totalData: 1,
            currentlyAttended: result.attendance?.length || 0,
            capacity: result.capacity
          },
        };
      }
    } catch (error) {
      throw error instanceof BadRequestException || error instanceof NotFoundException 
        ? error 
        : new BadRequestException('Error al actualizar asistencia: ' + error.message);
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
