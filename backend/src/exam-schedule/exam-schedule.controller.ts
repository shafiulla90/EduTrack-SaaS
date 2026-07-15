import { Controller, Get, Post, Body, Param, Query, Patch, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ExamScheduleService } from './exam-schedule.service';
import { CreateExamScheduleDto, UpdateExamScheduleDto, BulkCreateDto, BulkStatusDto, BulkDeleteDto } from './dto/exam-schedule.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exam-schedule')
@Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
export class ExamScheduleController {
  constructor(private readonly examScheduleService: ExamScheduleService) {}

  @Post('bulk')
  createBulk(@Body() dto: BulkCreateDto) {
    return this.examScheduleService.createBulk(dto);
  }

  @Patch('bulk')
  updateBulk(@Body() dto: BulkStatusDto) {
    return this.examScheduleService.updateBulk(dto);
  }

  @Post('bulk-delete')
  deleteBulk(@Body() dto: BulkDeleteDto) {
    return this.examScheduleService.deleteBulk(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.examScheduleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examScheduleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExamScheduleDto) {
    return this.examScheduleService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.examScheduleService.delete(id);
  }
}
