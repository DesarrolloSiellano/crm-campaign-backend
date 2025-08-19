import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MultilevelService } from './multilevel.service';
import { CreateMultilevelDto } from './dto/create-multilevel.dto';
import { UpdateMultilevelDto } from './dto/update-multilevel.dto';

@Controller('multilevel')
export class MultilevelController {
  constructor(private readonly multilevelService: MultilevelService) {}



  @Post()
  create(@Body() createMultilevelDto: CreateMultilevelDto) {
    return this.multilevelService.create(createMultilevelDto);
  }

  @Get()
  findAll() {
    return this.multilevelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.multilevelService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMultilevelDto: UpdateMultilevelDto) {
    return this.multilevelService.update(id, updateMultilevelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.multilevelService.remove(id);
  }
}
