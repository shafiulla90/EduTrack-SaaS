import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('classes')
  async getClasses() {
    return this.attendanceService.getClasses();
  }

  @Get('sections')
  async getSections() {
    return this.attendanceService.getSections();
  }

  @Get('teachers')
  async getTeachers() {
    return this.attendanceService.getTeachers();
  }

  @Get('recent')
  async getRecent() {
    return this.attendanceService.getRecentSubmissions();
  }

  @Get('history')
  async getHistory() {
    return this.attendanceService.getHistory();
  }

  @Get('students')
  async getStudents(
    @Query('classVal') classVal: string,
    @Query('sectionVal') sectionVal: string,
  ) {
    return this.attendanceService.getStudents(classVal, sectionVal);
  }

  @Get('session-data')
  async getSessionData(
    @Query('classVal') classVal: string,
    @Query('sectionVal') sectionVal: string,
    @Query('dateVal') dateVal: string,
  ) {
    return this.attendanceService.getSessionData(classVal, sectionVal, dateVal);
  }

  @Post('save')
  async save(@Body() data: any) {
    return this.attendanceService.saveAttendance(data);
  }

  @Get('report-data')
  async getReportData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getAttendanceData(startDate, endDate);
  }

  // Fallback REST paths (keeping existing endpoints to avoid breaking legacy routes)
  @Get('session')
  async getSession(
    @Query('classSectionId') classSectionId: string,
    @Query('date') date: string,
  ) {
    // Adapter to map classSectionId lookup to service
    const cs = await this.attendanceService['prisma'].classSection.findUnique({
      where: { id: classSectionId },
      include: { class: true, section: true },
    });
    if (!cs) {
      return { sessionExists: false, absentIds: [], total: 0, present: 0, absent: 0 };
    }
    return this.attendanceService.getSessionData(cs.class.name, cs.section.name, date);
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
