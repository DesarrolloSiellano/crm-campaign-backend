import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DigitalCardService } from './digital-card.service';
import { CreateDigitalCardDto } from './dto/create-digital-card.dto';

@Controller('digital-card')
export class DigitalCardController {
  constructor(private readonly digitalCardService: DigitalCardService) {}

  @Post()
  upsert(@Body() createDigitalCardDto: CreateDigitalCardDto) {
    return this.digitalCardService.upsert(createDigitalCardDto);
  }

  @Get(':company')
  findByCompany(@Param('company') company: string) {
    return this.digitalCardService.findByCompany(company);
  }
}
