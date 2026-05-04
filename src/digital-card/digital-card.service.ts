import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DigitalCard, DigitalCardDocument } from './schemas/digital-card.schema';
import { CreateDigitalCardDto } from './dto/create-digital-card.dto';

@Injectable()
export class DigitalCardService {
  constructor(
    @InjectModel(DigitalCard.name) private digitalCardModel: Model<DigitalCardDocument>,
  ) {}

  async upsert(createDigitalCardDto: CreateDigitalCardDto): Promise<DigitalCard> {
    const { company, ...updateData } = createDigitalCardDto;
    
    // Find by company and update, or create if it doesn't exist (upsert)
    const updatedCard = await this.digitalCardModel.findOneAndUpdate(
      { company },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    return updatedCard;
  }

  async findByCompany(company: string): Promise<DigitalCard> {
    const card = await this.digitalCardModel.findOne({ company }).exec();
    
    if (!card) {
      // Return a default object if not found so the frontend always has something
      return {
        company,
        headerBackground: '#33528b',
        headerTextColor: '#dde6f4',
        footerBackground: '#33528b',
        footerTextColor: '#ffffff',
        borderColor: '#33528b',
        borderRadius: 16,
        borderType: 'rounded',
        showHologram: false
      } as DigitalCard;
    }
    
    return card;
  }
}
