import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Leader } from '../leaders/entities/leader.entity';
import { Multilevel } from '../multilevel/entities/multilevel.entity';
import { Event } from '../events/entities/event.entity';
import moment from 'moment';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel('Leader') private readonly leaderModel: Model<Leader>,
    @InjectModel('Multilevel') private readonly multilevelModel: Model<Multilevel>,
    @InjectModel('Event') private readonly eventModel: Model<Event>,
  ) {}

  private getCampaignMatch(idCampaign: string): any {
    if (!idCampaign) {
      throw new BadRequestException('El idCampaign es requerido');
    }
    return mongoose.Types.ObjectId.isValid(idCampaign)
      ? { $in: [idCampaign, new mongoose.Types.ObjectId(idCampaign)] }
      : idCampaign;
  }

  async getPastEventsReport(company: string, idCampaign: string, startDate?: string, endDate?: string) {
    const campaignMatch = this.getCampaignMatch(idCampaign);
    const today = moment().format('YYYY-MM-DD');

    const query: any = {
      company,
      'campaign._id': campaignMatch,
      $or: [
        { status: { $in: ['COMPLETADO', 'CANCELADO'] } },
        { date: { $lt: today } }
      ]
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const events = await this.eventModel.find(query).sort({ date: -1 }).lean();

    return events.map((event) => ({
      'Título': event.title,
      'Descripción': event.description || '',
      'Fecha': event.date,
      'Hora Inicio': event.startTime,
      'Hora Fin': event.endTime,
      'Tipo': event.type,
      'Ubicación': event.location || '',
      'Enlace': event.link || '',
      'Capacidad': event.capacity || 0,
      'Asistentes Registrados': event.attendance?.length || 0,
      'Estado': event.status,
      'Fecha Creación': event.createdDate || '',
    }));
  }

  async getUpcomingEventsReport(company: string, idCampaign: string) {
    const campaignMatch = this.getCampaignMatch(idCampaign);
    const today = moment().format('YYYY-MM-DD');

    const query: any = {
      company,
      'campaign._id': campaignMatch,
      status: 'PROGRAMADO',
      date: { $gte: today }
    };

    const events = await this.eventModel.find(query).sort({ date: 1 }).lean();

    return events.map((event) => ({
      'Título': event.title,
      'Descripción': event.description || '',
      'Fecha': event.date,
      'Hora Inicio': event.startTime,
      'Hora Fin': event.endTime,
      'Tipo': event.type,
      'Ubicación': event.location || '',
      'Enlace': event.link || '',
      'Capacidad': event.capacity || 0,
      'Asistentes Registrados': event.attendance?.length || 0,
      'Estado': event.status,
    }));
  }

  async getLeadersFollowersReport(company: string, idCampaign: string, startDate?: string, endDate?: string) {
    const campaignMatch = this.getCampaignMatch(idCampaign);

    const leaderMatchQuery: any = {
      company,
      'campaign._id': campaignMatch,
    };

    // Obtenemos los líderes
    const leaders = await this.leaderModel.find(leaderMatchQuery).lean();

    // Obtenemos los seguidores
    const followerQuery: any = {
      company,
      level: { $ne: 1 },
      'campaign._id': campaignMatch,
    };

    if (startDate || endDate) {
      followerQuery.createdDate = {};
      if (startDate) followerQuery.createdDate.$gte = startDate;
      if (endDate) followerQuery.createdDate.$lte = endDate;
    }

    const followers = await this.multilevelModel.find(followerQuery).lean();

    // Estructurar un listado plano de líderes y seguidores para Excel
    const rows: any[] = [];

    for (const leader of leaders) {
      const leaderFollowers = followers.filter(
        (f) => f.idParentLevel?.toString() === leader._id.toString()
      );

      if (leaderFollowers.length === 0) {
        // Líder sin seguidores (en el rango de fechas)
        rows.push({
          'Documento Líder': leader.numeroDocumento,
          'Nombre Líder': `${leader.nombres} ${leader.apellidos}`.trim(),
          'Celular Líder': leader.celular,
          'Email Líder': leader.email || '',
          'Ciudad Líder': leader.ciudad || '',
          'Fecha Registro Líder': leader.fechaCreacion || '',
          'Nombre Seguidor': 'Sin seguidores registrados en el rango',
          'Celular Seguidor': '',
          'Email Seguidor': '',
          'Ciudad Seguidor': '',
          'Fecha Registro Seguidor': '',
        });
      } else {
        for (const follower of leaderFollowers) {
          rows.push({
            'Documento Líder': leader.numeroDocumento,
            'Nombre Líder': `${leader.nombres} ${leader.apellidos}`.trim(),
            'Celular Líder': leader.celular,
            'Email Líder': leader.email || '',
            'Ciudad Líder': leader.ciudad || '',
            'Fecha Registro Líder': leader.fechaCreacion || '',
            'Nombre Seguidor': `${follower.firstName} ${follower.lastName}`.trim(),
            'Celular Seguidor': follower.whatsapp || '',
            'Email Seguidor': follower.email || '',
            'Ciudad Seguidor': follower.city || '',
            'Fecha Registro Seguidor': follower.createdDate || '',
          });
        }
      }
    }

    return rows;
  }

  async getLeadersPerformanceReport(company: string, idCampaign: string) {
    const campaignMatch = this.getCampaignMatch(idCampaign);

    const leaders = await this.leaderModel.find({
      company,
      'campaign._id': campaignMatch
    }).lean();

    const followers = await this.multilevelModel.find({
      company,
      level: { $ne: 1 },
      'campaign._id': campaignMatch
    }).lean();

    return leaders.map((leader) => {
      const realFollowers = followers.filter(
        (f) => f.idParentLevel?.toString() === leader._id.toString()
      ).length;

      const metaVotantes = Number(leader.numeroVotantes) || 0;
      const cumplimiento = metaVotantes > 0 
        ? Math.round((realFollowers / metaVotantes) * 100) 
        : 0;

      return {
        'Documento': leader.numeroDocumento,
        'Nombre Completo': `${leader.nombres} ${leader.apellidos}`.trim(),
        'Celular': leader.celular,
        'Email': leader.email || '',
        'Meta de Votantes': metaVotantes,
        'Seguidores Reales': realFollowers,
        '% Cumplimiento': `${cumplimiento}%`,
        'Ciudad': leader.ciudad || '',
        'Barrio': leader.barrio || '',
      };
    });
  }

  async getDetailedAttendanceReport(company: string, idCampaign: string, startDate?: string, endDate?: string) {
    const campaignMatch = this.getCampaignMatch(idCampaign);

    const query: any = {
      company,
      'campaign._id': campaignMatch
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const events = await this.eventModel.find(query).sort({ date: -1 }).lean();
    const rows: any[] = [];

    events.forEach((event) => {
      const attendees = event.attendance || [];
      if (attendees.length === 0) {
        rows.push({
          'Evento': event.title,
          'Fecha Evento': event.date,
          'Tipo Evento': event.type,
          'Ubicación': event.location || event.link || '',
          'Nombre Asistente': 'Sin asistentes registrados',
          'Celular Asistente': '',
          'Email Asistente': '',
          'Rol Asistente': '',
          'Hora Check-In': '',
        });
      } else {
        attendees.forEach((attendee) => {
          rows.push({
            'Evento': event.title,
            'Fecha Evento': event.date,
            'Tipo Evento': event.type,
            'Ubicación': event.location || event.link || '',
            'Nombre Asistente': attendee.fullName || '',
            'Celular Asistente': attendee.phone || '',
            'Email Asistente': attendee.email || '',
            'Rol Asistente': attendee.role || '',
            'Hora Check-In': attendee.checkIn ? moment(attendee.checkIn).format('HH:mm:ss') : '',
          });
        });
      }
    });

    return rows;
  }

  async getGeoDistributionReport(company: string, idCampaign: string) {
    const campaignMatch = this.getCampaignMatch(idCampaign);

    const leaders = await this.leaderModel.find({
      company,
      'campaign._id': campaignMatch
    }).lean();

    const followers = await this.multilevelModel.find({
      company,
      level: { $ne: 1 },
      'campaign._id': campaignMatch
    }).lean();

    const rows: any[] = [];

    // Agregar Líderes
    leaders.forEach((leader) => {
      rows.push({
        'Tipo': 'Líder',
        'Nombre Completo': `${leader.nombres} ${leader.apellidos}`.trim(),
        'Celular': leader.celular,
        'Email': leader.email || '',
        'Departamento': leader.departamento || '',
        'Ciudad': leader.ciudad || '',
        'Comuna': leader.comuna || '',
        'Barrio': leader.barrio || '',
        'Vereda': leader.vereda || '',
        'Corregimiento': leader.corregimiento || '',
      });
    });

    // Agregar Seguidores
    followers.forEach((follower) => {
      rows.push({
        'Tipo': 'Seguidor',
        'Nombre Completo': `${follower.firstName} ${follower.lastName}`.trim(),
        'Celular': follower.whatsapp,
        'Email': follower.email || '',
        'Departamento': follower.state || '',
        'Ciudad': follower.city || '',
        'Comuna': '',
        'Barrio': follower.address || '',
        'Vereda': '',
        'Corregimiento': '',
      });
    });

    return rows;
  }

  async getDemographicsReport(company: string, idCampaign: string) {
    const campaignMatch = this.getCampaignMatch(idCampaign);

    const leaders = await this.leaderModel.find({
      company,
      'campaign._id': campaignMatch
    }).lean();

    return leaders.map((leader) => {
      let edad = 0;
      let rangoEdad = 'No registrado';

      if (leader.fechaNacimiento) {
        const birthDate = moment(leader.fechaNacimiento, 'YYYY-MM-DD');
        if (birthDate.isValid()) {
          edad = moment().diff(birthDate, 'years');
          
          if (edad < 18) rangoEdad = 'Menor de 18';
          else if (edad >= 18 && edad <= 29) rangoEdad = '18 - 29 años';
          else if (edad >= 30 && edad <= 49) rangoEdad = '30 - 49 años';
          else rangoEdad = '50 años o más';
        }
      }

      return {
        'Documento': leader.numeroDocumento,
        'Nombre Completo': `${leader.nombres} ${leader.apellidos}`.trim(),
        'Género': leader.sexo || 'No registrado',
        'Fecha Nacimiento': leader.fechaNacimiento || '',
        'Edad': edad || '',
        'Rango de Edad': rangoEdad,
        'Celular': leader.celular,
        'Email': leader.email || '',
        'Tipo de Líder': leader.tipoLider || '',
      };
    });
  }

  async getStatsPDFReport(company: string, idCampaign: string) {
    const campaignMatch = this.getCampaignMatch(idCampaign);

    // 1. Obtener totales
    const totalLeaders = await this.leaderModel.countDocuments({
      company,
      'campaign._id': campaignMatch,
    });

    const totalFollowers = await this.multilevelModel.countDocuments({
      company,
      level: { $ne: 1 },
      'campaign._id': campaignMatch,
    });

    // 2. Ranking de líderes
    const rankingLeaders = await this.leaderModel.aggregate([
      { $match: { company, 'campaign._id': campaignMatch } },
      {
        $lookup: {
          from: 'multilevels',
          localField: '_id',
          foreignField: 'idParentLevel',
          as: 'followers',
        },
      },
      {
        $project: {
          nombres: 1,
          apellidos: 1,
          celular: 1,
          email: 1,
          followerCount: {
            $size: {
              $filter: {
                input: '$followers',
                as: 'f',
                cond: { $ne: ['$$f.level', 1] },
              },
            },
          },
        },
      },
      { $sort: { followerCount: -1 } },
      { $limit: 10 },
    ]);

    // 3. Crecimiento de líderes/seguidores en los últimos 30 días para gráfica
    const thirtyDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const growthData = await this.multilevelModel.aggregate([
      {
        $match: {
          company,
          level: { $ne: 1 },
          'campaign._id': campaignMatch,
          createdDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$createdDate',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      totalLeaders,
      totalFollowers,
      rankingLeaders,
      growthData: growthData.map(item => ({ date: item._id, count: item.count }))
    };
  }
}
