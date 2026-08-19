import { ExamConfigService, GradeRange } from './exam-config.service';
export declare class ExamConfigController {
    private examConfigService;
    constructor(examConfigService: ExamConfigService);
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
    resolveConfig(examType: string): Promise<import("./exam-config.service").ResolvedExamConfig>;
    getDefaults(): {
        gradeRanges: GradeRange[];
    };
    upsertConfig(examTypeName: string | null, passingPercentage: number, maxMarks: number | undefined, gradeRanges: GradeRange[] | undefined, classId: string | undefined, academicYearId: string | undefined, subjectConfigs: any[] | undefined): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        academicYearId: string | null;
        classId: string | null;
        maxMarks: number;
        passingPercentage: import("@prisma/client/runtime/library").Decimal;
        gradeRanges: import("@prisma/client/runtime/library").JsonValue | null;
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
        passingPercentage: import("@prisma/client/runtime/library").Decimal;
        gradeRanges: import("@prisma/client/runtime/library").JsonValue | null;
        examTypeName: string | null;
    }>;
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
        passingPercentage: import("@prisma/client/runtime/library").Decimal;
        passMarks: import("@prisma/client/runtime/library").Decimal | null;
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
        passingPercentage: import("@prisma/client/runtime/library").Decimal;
        passMarks: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
