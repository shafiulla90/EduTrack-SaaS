import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
export declare const DEFAULT_GRADE_RANGES: GradeRange[];
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
    source: 'exam-specific' | 'class-specific' | 'global' | 'system-default';
    subjectConfigs?: any[];
}
export declare class ExamConfigService {
    private prisma;
    constructor(prisma: PrismaService);
    private getTenantId;
    resolveConfig(examTypeName: string, classId?: string, academicYearId?: string, tenantId?: string, db?: any): Promise<ResolvedExamConfig>;
    calculateGrade(percentage: number, ranges: GradeRange[]): GradeRange;
    listConfigs(): Promise<{
        id: string;
        examTypeName: string;
        isGlobal: boolean;
        passingPercentage: number;
        maxMarks: number;
        gradeRanges: GradeRange[];
        academicYearId: string;
        classId: string;
        className: string;
        subjectConfigs: {
            passMarks: number;
            passingPercentage: number;
            id: string;
            updatedAt: Date;
            tenantId: string;
            createdAt: Date;
            subjectId: string;
            subjectType: string;
            remarks: string | null;
            maxMarks: number;
            examConfigId: string;
        }[];
        updatedAt: Date;
    }[]>;
    upsertConfig(dto: {
        examTypeName: string | null;
        passingPercentage: number;
        maxMarks?: number;
        gradeRanges?: GradeRange[];
        classId?: string;
        academicYearId?: string;
        subjectConfigs?: {
            subjectId: string;
            subjectType: string;
            maxMarks: number;
            passMarks?: number;
            passingPercentage: number;
            remarks?: string;
        }[];
    }): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        academicYearId: string | null;
        classId: string | null;
        maxMarks: number;
        passingPercentage: Prisma.Decimal;
        gradeRanges: Prisma.JsonValue | null;
        examTypeName: string | null;
    }>;
    deleteConfig(id: string): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        academicYearId: string | null;
        classId: string | null;
        maxMarks: number;
        passingPercentage: Prisma.Decimal;
        gradeRanges: Prisma.JsonValue | null;
        examTypeName: string | null;
    }>;
    getDefaultGradeRanges(): GradeRange[];
    listComponents(): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
    }[]>;
    createComponent(name: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
    }>;
    deleteComponent(id: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
    }>;
    getOrInitializeExamSubject(examId: string, subjectId: string, subjectType?: string, tenantId?: string, db?: any): Promise<any>;
    getExamSubjects(examId: string): Promise<({
        subject: {
            id: string;
            isActive: boolean;
            name: string;
            tenantId: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        examId: string;
        subjectId: string;
        subjectType: string;
        remarks: string | null;
        maxMarks: number;
        passingPercentage: Prisma.Decimal;
        passMarks: Prisma.Decimal | null;
    })[]>;
    updateExamSubject(id: string, dto: {
        maxMarks?: number;
        passMarks?: number;
        passingPercentage?: number;
        subjectType?: string;
        remarks?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        examId: string;
        subjectId: string;
        subjectType: string;
        remarks: string | null;
        maxMarks: number;
        passingPercentage: Prisma.Decimal;
        passMarks: Prisma.Decimal | null;
    }>;
    createExamSubjectsForExam(examId: string, classSectionId: string, tenantId?: string, db?: any): Promise<void>;
}
