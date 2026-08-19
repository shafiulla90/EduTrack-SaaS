import { Controller, Get, Post, Param, Body, Query, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('session')
  getSession(
    @Query('classSectionId') classSectionId: string,
    @Query('date') date: string,
    @Request() req?: any,
  ) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.attendanceService.getSession(tenantId, classSectionId, date);
  }

  @Post('save')
  saveAttendance(@Body() body: any, @Request() req?: any) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.attendanceService.saveAttendance(tenantId, {
      classSectionId: body.classSectionId,
      date: body.date,
      teacherId: body.teacherId,
      presentCount: body.presentCount,
      absentCount: body.absentCount,
      totalStudents: body.totalStudents,
      absentStudentIds: body.absentStudentIds || [],
    });
  }

  @Get('class-report')
  getClassReport(
    @Query('classSectionId') classSectionId?: string,
    @Query('date') date?: string,
    @Request() req?: any,
  ) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.attendanceService.getClassReport(tenantId, classSectionId, date);
  }

  @Get('history')
  getHistory(
    @Query('classSectionId') classSectionId?: string,
    @Request() req?: any,
  ) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.attendanceService.getHistory(tenantId, classSectionId);
  }

  @Post()
  create(@Body() dto: any, @Request() req) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.attendanceService.create(tenantId, {
      studentId: dto.studentId,
      date: dto.date,
      status: dto.status,
    });
  }

  @Get()
  findAll(@Request() req) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.attendanceService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.attendanceService.findOne(id, tenantId);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string, @Request() req) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.attendanceService.findByStudent(studentId, tenantId);
  }
}
