import {
  Controller, Get, Post, Delete, Body, Query, Param, UseGuards,
} from '@nestjs/common';
import { ExamConfigService, GradeRange } from './exam-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exam-config')
export class ExamConfigController {
  constructor(private examConfigService: ExamConfigService) {}

  /** Admin: list all configs for the tenant */
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  @Get()
  async listConfigs() {
    return this.examConfigService.listConfigs();
  }

  /** Everyone (teachers, parents via parent-portal service): resolve config for a specific exam type */
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN, Role.TEACHER, Role.PARENT)
  @Get('resolve')
  async resolveConfig(@Query('examType') examType: string) {
    return this.examConfigService.resolveConfig(examType || '__global__');
  }

  /** Admin: get default grade ranges */
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  @Get('defaults')
  getDefaults() {
    return { gradeRanges: this.examConfigService.getDefaultGradeRanges() };
  }

  /** Admin: create or update a config entry */
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  @Post()
  async upsertConfig(
    @Body('examTypeName') examTypeName: string | null,
    @Body('passingPercentage') passingPercentage: number,
    @Body('maxMarks') maxMarks: number | undefined,
    @Body('gradeRanges') gradeRanges: GradeRange[] | undefined,
  ) {
    return this.examConfigService.upsertConfig({
      examTypeName: examTypeName ?? null,
      passingPercentage: Number(passingPercentage),
      maxMarks: maxMarks ? Number(maxMarks) : undefined,
      gradeRanges,
    });
  }

  /** Admin: delete a specific config (exam-specific override) */
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async deleteConfig(@Param('id') id: string) {
    return this.examConfigService.deleteConfig(id);
  }

  // ── Subject Component Endpoints ───────────────────────────────────────────
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  @Get('components')
  async listComponents() {
    return this.examConfigService.listComponents();
  }

  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  @Post('components')
  async createComponent(@Body('name') name: string) {
    return this.examConfigService.createComponent(name);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  @Delete('components/:id')
  async deleteComponent(@Param('id') id: string) {
    return this.examConfigService.deleteComponent(id);
  }

  // ── ExamSubject Endpoints ─────────────────────────────────────────────────
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @Get('exam-subjects')
  async getExamSubjects(@Query('examId') examId: string) {
    if (!examId) return [];
    return this.examConfigService.getExamSubjects(examId);
  }

  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @Post('exam-subjects/:id')
  async updateExamSubject(
    @Param('id') id: string,
    @Body() dto: { maxMarks?: number; passMarks?: number; passingPercentage?: number; subjectType?: string; remarks?: string; }
  ) {
    return this.examConfigService.updateExamSubject(id, dto);
  }
}
