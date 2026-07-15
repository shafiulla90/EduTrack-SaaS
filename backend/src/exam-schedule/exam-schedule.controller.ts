import { Controller, Get, Post, Body, Param, Query, Patch, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ExamScheduleService } from './exam-schedule.service';
import { CreateExamScheduleDto, UpdateExamScheduleDto, BulkCreateDto, BulkStatusDto, BulkDeleteDto } from './dto/exam-schedule.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exam-schedule')
export class ExamScheduleController {
  constructor(private readonly examScheduleService: ExamScheduleService) {}

  @Post('bulk')
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  createBulk(@Body() dto: BulkCreateDto) {
    return this.examScheduleService.createBulk(dto);
  }

  @Patch('bulk')
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  updateBulk(@Body() dto: BulkStatusDto) {
    return this.examScheduleService.updateBulk(dto);
  }

  @Post('bulk-delete')
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  deleteBulk(@Body() dto: BulkDeleteDto) {
    return this.examScheduleService.deleteBulk(dto);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  findAll(@Query() query: any) {
    return this.examScheduleService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string) {
    return this.examScheduleService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateExamScheduleDto) {
    return this.examScheduleService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  delete(@Param('id') id: string) {
    return this.examScheduleService.delete(id);
  }
}
