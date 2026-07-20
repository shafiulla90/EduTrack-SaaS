import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenants/tenant.context';
import { Prisma } from '@prisma/client';

// ── Default grade ranges used when none are configured ────────────────────────
export const DEFAULT_GRADE_RANGES: GradeRange[] = [
  { min: 90, max: 100, grade: 'A+', gpa: 10, label: 'Outstanding' },
  { min: 80, max:  89, grade: 'A',  gpa: 9,  label: 'Excellent'   },
  { min: 70, max:  79, grade: 'B+', gpa: 8,  label: 'Very Good'   },
  { min: 60, max:  69, grade: 'B',  gpa: 7,  label: 'Good'        },
  { min: 50, max:  59, grade: 'C',  gpa: 6,  label: 'Average'     },
  { min: 35, max:  49, grade: 'D',  gpa: 5,  label: 'Below Avg'   },
  { min:  0, max:  34, grade: 'F',  gpa: 0,  label: 'Fail'        },
];

export interface GradeRange {
  min: number;
  max: number;
  grade: string;
  gpa: number;
  label: string;
}

export interface ResolvedExamConfig {
  passingPercentage: number;
  maxMarks: number;
  gradeRanges: GradeRange[];
  /** Which config was resolved: 'exam-specific' | 'global' | 'system-default' */
  source: 'exam-specific' | 'global' | 'system-default';
}

function parseGradeRanges(raw: Prisma.JsonValue | null): GradeRange[] {
  if (!raw || !Array.isArray(raw)) return DEFAULT_GRADE_RANGES;
  return raw as unknown as GradeRange[];
}

@Injectable()
export class ExamConfigService {
  constructor(private prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) throw new BadRequestException('No active school tenant context found');
    return tenantId;
  }

  // ── Core: resolve config for a specific exam type ──────────────────────────
  async resolveConfig(examTypeName: string, tenantId?: string): Promise<ResolvedExamConfig> {
    const tid = tenantId ?? this.getTenantId();

    // 1. Try exam-specific config
    const specific = await this.prisma.examConfig.findUnique({
      where: { tenantId_examTypeName: { tenantId: tid, examTypeName } },
    });
    if (specific) {
      return {
        passingPercentage: Number(specific.passingPercentage),
        maxMarks: specific.maxMarks,
        gradeRanges: parseGradeRanges(specific.gradeRanges),
        source: 'exam-specific',
      };
    }

    // 2. Try global config (stored under key '__global__')
    const globalCfg = await this.prisma.examConfig.findUnique({
      where: { tenantId_examTypeName: { tenantId: tid, examTypeName: '__global__' } },
    });
    if (globalCfg) {
      return {
        passingPercentage: Number(globalCfg.passingPercentage),
        maxMarks: globalCfg.maxMarks,
        gradeRanges: parseGradeRanges(globalCfg.gradeRanges),
        source: 'global',
      };
    }

    // 3. System default
    return {
      passingPercentage: 35,
      maxMarks: 100,
      gradeRanges: DEFAULT_GRADE_RANGES,
      source: 'system-default',
    };
  }

  // ── Grade calculation ──────────────────────────────────────────────────────
  calculateGrade(percentage: number, ranges: GradeRange[]): GradeRange {
    const active = ranges && ranges.length > 0 ? ranges : DEFAULT_GRADE_RANGES;
    const sorted = [...active].sort((a, b) => b.min - a.min);
    return (
      sorted.find(r => percentage >= r.min && percentage <= r.max) ??
      { min: 0, max: 0, grade: 'F', gpa: 0, label: 'Fail' }
    );
  }

  // ── List all configs for a tenant ─────────────────────────────────────────
  async listConfigs() {
    const tenantId = this.getTenantId();
    const configs = await this.prisma.examConfig.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
    return configs.map(c => ({
      id: c.id,
      examTypeName: c.examTypeName === '__global__' ? null : c.examTypeName,
      isGlobal: c.examTypeName === '__global__',
      passingPercentage: Number(c.passingPercentage),
      maxMarks: c.maxMarks,
      gradeRanges: parseGradeRanges(c.gradeRanges),
      updatedAt: c.updatedAt,
    }));
  }

  // ── Upsert (create or update) ──────────────────────────────────────────────
  async upsertConfig(dto: {
    examTypeName: string | null;   // null = global
    passingPercentage: number;
    maxMarks?: number;
    gradeRanges?: GradeRange[];
  }) {
    const tenantId = this.getTenantId();

    if (dto.passingPercentage < 0 || dto.passingPercentage > 100) {
      throw new BadRequestException('Passing percentage must be between 0 and 100');
    }

    const key = dto.examTypeName === null ? '__global__' : dto.examTypeName.trim();
    const gradeRangesJson = dto.gradeRanges
      ? (dto.gradeRanges as unknown as Prisma.InputJsonValue)
      : Prisma.JsonNull;

    return this.prisma.examConfig.upsert({
      where: { tenantId_examTypeName: { tenantId, examTypeName: key } },
      create: {
        tenantId,
        examTypeName: key,
        passingPercentage: dto.passingPercentage,
        maxMarks: dto.maxMarks ?? 100,
        gradeRanges: gradeRangesJson,
      },
      update: {
        passingPercentage: dto.passingPercentage,
        maxMarks: dto.maxMarks ?? 100,
        gradeRanges: gradeRangesJson,
      },
    });
  }

  // ── Delete a specific config ───────────────────────────────────────────────
  async deleteConfig(id: string) {
    const tenantId = this.getTenantId();
    const record = await this.prisma.examConfig.findUnique({ where: { id } });
    if (!record || record.tenantId !== tenantId) {
      throw new BadRequestException('Exam config not found');
    }
    return this.prisma.examConfig.delete({ where: { id } });
  }

  // ── Get default grade ranges (for frontend) ───────────────────────────────
  getDefaultGradeRanges(): GradeRange[] {
    return DEFAULT_GRADE_RANGES;
  }
}
