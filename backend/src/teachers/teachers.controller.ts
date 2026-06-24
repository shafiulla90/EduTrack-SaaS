import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private teachersService: TeachersService) {}

  @Post()
  async create(@Body() data: any) {
    return this.teachersService.createTeacher(data);
  }

  @Get('teaching-staff')
  async getTeachingStaff() {
    return this.teachersService.getTeachingStaff();
  }

  @Get()
  async getAll() {
    return this.teachersService.getTeachers();
  }

  @Post(':id/assignments')
  async assign(
    @Param('id') id: string,
    @Body('classSectionId') classSectionId: string,
    @Body('subjectId') subjectId: string,
    @Body('periodsPerWeek') periodsPerWeek: number,
  ) {
    return this.teachersService.assignClassSubject(id, classSectionId, subjectId, periodsPerWeek);
  }

  @Get(':id/assignments')
  async getAssignments(@Param('id') id: string) {
    return this.teachersService.getAssignments(id);
  }

  @Post(':id/skills')
  async addSkill(
    @Param('id') id: string,
    @Body('subjectId') subjectId: string,
    @Body('skillLevel') skillLevel: string,
    @Body('yearsOfExperience') yearsOfExperience: number,
  ) {
    return this.teachersService.saveSkill(id, subjectId, skillLevel, yearsOfExperience);
  }

  @Get(':id/skills')
  async getSkills(@Param('id') id: string) {
    return this.teachersService.getSkills(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.teachersService.updateTeacher(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.teachersService.deleteTeacher(id);
  }

  @Post(':id/pay-salary')
  async paySalary(@Param('id') id: string, @Body('month') month: string) {
    return this.teachersService.paySalary(id, month);
  }

  @Post('pay-all-salaries')
  async payAllSalaries(@Body('month') month: string) {
    return this.teachersService.payAllSalaries(month);
  }
}
