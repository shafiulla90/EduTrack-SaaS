import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Teacher Portal Marks')
@Controller('teacher-portal')
export class TeacherPortalController {
  constructor(private readonly examsService: ExamsService) {}

  @Get('classes')
  @ApiOperation({ summary: 'Get teacher classes' })
  async getClasses() {
    return [
      { id: 'cs-1', classSectionId: 'cs-1', className: 'Grade 10', sectionName: 'Section A', name: 'Grade 10 - Section A' },
      { id: 'cs-2', classSectionId: 'cs-2', className: 'Class-2', sectionName: 'Section A', name: 'Class-2 - Section A' },
      { id: 'cs-3', classSectionId: 'cs-3', className: 'Grade 1', sectionName: 'Section A', name: 'Grade 1 - Section A' },
    ];
  }

  @Get('marks/entry')
  @ApiOperation({ summary: 'Get marks entry roster' })
  async getMarksEntry(
    @Query('subjectId') subjectId: string,
    @Query('examName') examName: string,
    @Query('classSectionId') classSectionId: string,
    @Query('subjectType') subjectType?: string,
    @Request() req?: any,
  ) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.examsService.getMarksEntryRoster(tenantId, subjectId, examName, classSectionId, subjectType);
  }

  @Post('marks/save')
  @ApiOperation({ summary: 'Save marks roster' })
  async saveMarks(@Body() body: any, @Request() req?: any) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.examsService.saveRosterMarks(tenantId, body);
  }
}

@ApiTags('Exam Config')
@Controller('exam-config')
export class ExamConfigController {
  constructor(private readonly examsService: ExamsService) {}

  @Get('components')
  @ApiOperation({ summary: 'Get exam components' })
  async getComponents(@Request() req?: any) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.examsService.getComponents(tenantId);
  }
}
