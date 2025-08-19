import { PartialType } from '@nestjs/swagger';
import { CreateMultilevelDto } from './create-multilevel.dto';

export class UpdateMultilevelDto extends PartialType(CreateMultilevelDto) {}
