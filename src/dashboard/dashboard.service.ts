import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Leader } from '../leaders/entities/leader.entity';
import { Multilevel } from '../multilevel/entities/multilevel.entity';
import { Event } from '../events/entities/event.entity';
import moment from 'moment';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('Leader') private readonly leaderModel: Model<Leader>,
    @InjectModel('Multilevel') private readonly multilevelModel: Model<Multilevel>,
    @InjectModel('Event') private readonly eventModel: Model<Event>,
  ) {}

  async getStats(company: string, idCampaign: string, limitLeaders = 5) {
    if (!idCampaign) {
      throw new BadRequestException('El idCampaign es requerido');
    }

    const campaignMatch: any = mongoose.Types.ObjectId.isValid(idCampaign)
      ? { $in: [idCampaign, new mongoose.Types.ObjectId(idCampaign)] }
      : idCampaign;

    const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');

    // Ejecutamos consultas de forma paralela para mayor eficiencia
    const [
      totalLeaders,
      totalFollowers,
      newFollowers,
      rankingLeaders,
      upcomingEvents,
    ] = await Promise.all([
      // 1. Total de líderes
      this.leaderModel.countDocuments({
        company,
        'campaign._id': campaignMatch,
      }),

      // 2. Total de seguidores (excluyendo a los propios líderes de nivel 1)
      this.multilevelModel.countDocuments({
        company,
        level: { $ne: 1 },
        'campaign._id': campaignMatch,
      }),

      // 3. Seguidores nuevos en los últimos 7 días
      this.multilevelModel.countDocuments({
        company,
        level: { $ne: 1 },
        'campaign._id': campaignMatch,
        createdDate: { $gte: sevenDaysAgo },
      }),

      // 4. Ranking de líderes por cantidad de seguidores agregados
      this.leaderModel.aggregate([
        {
          $match: {
            company,
            'campaign._id': campaignMatch,
          },
        },
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
            _id: 1,
            nombres: 1,
            apellidos: 1,
            celular: 1,
            email: 1,
            urlFoto: 1,
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
        { $limit: limitLeaders },
      ]),

      // 5. Los 3 próximos eventos
      this.eventModel
        .find({
          company,
          'campaign._id': campaignMatch,
          date: { $gte: today },
        })
        .sort({ date: 1, startTime: 1 })
        .limit(3)
        .lean(),
    ]);

    return {
      totalLeaders,
      totalFollowers,
      newFollowers,
      rankingLeaders,
      upcomingEvents,
    };
  }
}
