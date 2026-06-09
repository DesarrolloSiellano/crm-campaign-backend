import { PartialType } from '@nestjs/swagger';
import { CreateDigitalCardDto } from './create-digital-card.dto';

export class UpdateDigitalCardDto extends PartialType(CreateDigitalCardDto) {}
