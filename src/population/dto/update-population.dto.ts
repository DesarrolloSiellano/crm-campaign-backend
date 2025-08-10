import { PartialType } from '@nestjs/swagger';
import { CreatePopulationDto } from './create-population.dto';

export class UpdatePopulationDto extends PartialType(CreatePopulationDto) {}
