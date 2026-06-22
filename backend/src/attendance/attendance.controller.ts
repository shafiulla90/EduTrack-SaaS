import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('recent')
  async getRecent() {
    return this.attendanceService.getRecentSubmissions();
  }

  @Get('session')
  async getSession(
    @Query('classSectionId') classSectionId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getSessionData(classSectionId, date);
  }

  @Post('save')
  async save(@Body() data: any) {
    return this.attendanceService.saveAttendance(data);
  }
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.attendanceService.getAttendanceById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.attendanceService.updateAttendance(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.attendanceService.deleteAttendance(id);
  }

  @Get('summary/daily')
  async getDailySummary(@Query('date') date?: string) {
    return this.attendanceService.getDailySummary(date);
  }

  @Get('summary/monthly')
  async getMonthlySummary(@Query('month') month?: string, @Query('year') year?: string) {
    return this.attendanceService.getMonthlySummary(month, year);
  }

  @Get('report/class')
  async getClassReport(@Query('classSectionId') classSectionId: string, @Query('date') date?: string) {
    return this.attendanceService.getClassAttendanceReport(classSectionId, date);
  }

  @Get('report/student')
  async getStudentReport(@Query('studentId') studentId: string, @Query('date') date?: string) {
    return this.attendanceService.getStudentAttendanceReport(studentId, date);
  }
}

