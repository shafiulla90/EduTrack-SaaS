import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateClassDto,
  CreateSectionDto,
  CreateSubjectDto,
  BulkSubjectsInputDto,
  CreateTeacherWithSkillsDto,
  BulkTeachersInputDto,
  CreateClassSectionDto,
  UpdateTeacherAssignmentDto,
  SaveSubstituteDto,
  SaveTimetablePeriodsDto,
  PeriodTimingDto,
} from './dto/timetable.dto';

@UseGuards(JwtAuthGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get('academic-years')
  getAcademicYears() {
    return this.timetableService.getAcademicYears();
  }

  @Get('classes')
  getClasses() {
    return this.timetableService.getClasses();
  }

  @Post('classes')
  createClass(@Body() dto: CreateClassDto) {
    return this.timetableService.createClass(dto.name);
  }

  @Delete('classes/:id')
  deleteClass(@Param('id') id: string) {
    return this.timetableService.deleteClass(id);
  }

  @Get('sections')
  getSections() {
    return this.timetableService.getSections();
  }

  @Post('sections')
  createSection(@Body() dto: CreateSectionDto) {
    return this.timetableService.createSection(dto.name);
  }

  @Delete('sections/:id')
  deleteSection(@Param('id') id: string) {
    return this.timetableService.deleteSection(id);
  }

  @Get('period-timings')
  getPeriodTimings() {
    return this.timetableService.getPeriodTimings();
  }

  @Post('period-timings')
  savePeriodTimings(@Body() dto: PeriodTimingDto[]) {
    return this.timetableService.savePeriodTimings(dto);
  }

  @Get('subjects')
  getSubjects() {
    return this.timetableService.getSubjects();
  }

  @Post('subjects')
  createSubject(@Body() dto: CreateSubjectDto) {
    return this.timetableService.createSubject(dto);
  }

  @Post('subjects/bulk')
  bulkCreateSubjects(@Body() dto: BulkSubjectsInputDto) {
    return this.timetableService.bulkCreateSubjects(dto.subjects);
  }

  @Get('teachers/subject')
  getTeachersForSubject(@Query('subjectIds') subjectIds: string) {
    const ids = subjectIds ? subjectIds.split(',') : [];
    return this.timetableService.getTeachersForSubject(ids);
  }

  @Post('teachers')
  createTeacher(@Body() dto: CreateTeacherWithSkillsDto) {
    return this.timetableService.createTeacherWithSkills(dto);
  }

  @Post('teachers/bulk')
  bulkCreateTeachers(@Body() dto: BulkTeachersInputDto) {
    return this.timetableService.bulkCreateTeachers(dto.teachers);
  }

  @Get('workload/summary')
  getWorkloadSummary(@Query('academicYearId') academicYearId: string) {
    return this.timetableService.getWorkloadSummary(academicYearId);
  }

  @Get('workload/teachers')
  getAllTeacherWorkloads() {
    return this.timetableService.getAllTeacherWorkloads();
  }

  @Get('workload/classes')
  getAllClassWorkloads() {
    return this.timetableService.getAllClassWorkloads();
  }

  @Get('workload/teacher/:id')
  getTeacherWorkload(@Param('id') id: string) {
    return this.timetableService.getTeacherWorkload(id);
  }

  @Get('workload/class-section/:id')
  getClassSectionWorkload(@Param('id') id: string) {
    return this.timetableService.getClassSectionWorkload(id);
  }

  @Patch('assignments/:id')
  updateTeacherAssignment(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherAssignmentDto,
  ) {
    return this.timetableService.updateTeacherAssignment(
      id,
      dto.newTeacherId,
      dto.periodsPerWeek
    );
  }

  @Delete('assignments/:id')
  deleteTeacherAssignment(@Param('id') id: string) {
    return this.timetableService.deleteTeacherAssignment(id);
  }

  @Post('class-sections')
  createClassSection(@Body() dto: CreateClassSectionDto) {
    return this.timetableService.createClassSection(dto);
  }

  @Get('class-sections')
  getAllClassSections() {
    return this.timetableService.getAllClassSections();
  }

  @Get('teachers')
  getAllTeachers() {
    return this.timetableService.getAllTeachers();
  }

  @Get('class/:classSectionId/periods')
  getPeriodsForClassSection(
    @Param('classSectionId') classSectionId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.timetableService.getTimetableForClass(
      classSectionId,
      academicYearId,
      startDate,
      endDate
    );
  }

  @Get('teacher/:teacherId/periods')
  getPeriodsForTeacher(
    @Param('teacherId') teacherId: string,
    @Query('gaps') gaps: string,
  ) {
    if (gaps === 'true') {
      return this.timetableService.getPeriodsForTeacherWithGaps(teacherId);
    }
    return this.timetableService.getPeriodsForTeacher(teacherId);
  }

  @Get('teacher/:teacherId/leaser-periods')
  getLeaserPeriodsForTeacher(@Param('teacherId') teacherId: string) {
    return this.timetableService.getLeaserPeriodsForTeacher(teacherId);
  }

  @Post('periods/substitute')
  saveSubstituteForPeriod(@Body() dto: SaveSubstituteDto) {
    return this.timetableService.saveSubstituteForPeriod(
      dto.periodId,
      dto.substituteTeacherId
    );
  }

  @Post('periods/save')
  saveTimetablePeriods(@Body() dto: SaveTimetablePeriodsDto) {
    return this.timetableService.saveTimetablePeriods(dto);
  }

  @Get('teachers/:id/skills')
  getTeacherSkills(@Param('id') id: string) {
    return this.timetableService.getTeacherSkills(id);
  }

  @Get('teachers/subject-in-class')
  getTeachersForSubjectInClass(
    @Query('subjectId') subjectId: string,
    @Query('classSectionId') classSectionId: string,
  ) {
    return this.timetableService.getTeachersForSubjectInClass(subjectId, classSectionId);
  }

  @Get('skill-level-options')
  getSkillLevelOptions() {
    return this.timetableService.getSkillLevelOptions();
  }
}
