import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DigitalCard,
  DigitalCardDocument,
} from './schemas/digital-card.schema';
import { CreateDigitalCardDto } from './dto/create-digital-card.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DigitalCardService {
  constructor(
    @InjectModel(DigitalCard.name)
    private digitalCardModel: Model<DigitalCardDocument>,
  ) {}

  async upsert(
    createDigitalCardDto: CreateDigitalCardDto,
  ): Promise<any> {
    const { company, ...updateData } = createDigitalCardDto;

    // Find by company and update, or create if it doesn't exist (upsert)
    const updatedCard = await this.digitalCardModel
      .findOneAndUpdate(
        { company },
        { $set: updateData },
        { new: true, upsert: true, setDefaultsOnInsert: true, lean: true },
      )
      .exec();

    return {
      message: 'Digital card configured successfully',
      statusCode: 200,
      status: 'Success',
      data: [updatedCard as DigitalCard],
      meta: {
        totalData: 1,
      },
    };
  }

  async findByCompany(company: string): Promise<any> {
    const card = await this.digitalCardModel.findOne({ company }).lean().exec();

    const resultCard = card || {
      company,
      headerBackground: '#33528b',
      headerTextColor: '#dde6f4',
      footerBackground: '#33528b',
      footerTextColor: '#ffffff',
      borderColor: '#33528b',
      borderRadius: 16,
      borderType: 'rounded',
      showHologram: false,
    } as DigitalCard;

    return {
      message: 'Digital card found',
      statusCode: 200,
      status: 'Success',
      data: [resultCard],
      meta: {
        totalData: 1,
      },
    };
  }
}
