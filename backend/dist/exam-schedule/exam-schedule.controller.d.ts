import { ExamScheduleService } from './exam-schedule.service';
import { UpdateExamScheduleDto, BulkCreateDto, BulkStatusDto, BulkDeleteDto } from './dto/exam-schedule.dto';
export declare class ExamScheduleController {
    private readonly examScheduleService;
    constructor(examScheduleService: ExamScheduleService);
    createBulk(dto: BulkCreateDto, req: any): Promise<any[]>;
    updateBulk(dto: BulkStatusDto): Promise<any[]>;
    deleteBulk(dto: BulkDeleteDto): Promise<{
        success: boolean;
    }>;
    findAll(query: any, req: any): Promise<({
        academicYear: {
            id: string;
            isActive: boolean;
            name: string;
            tenantId: string;
            startDate: Date;
            endDate: Date;
        };
        classSection: {
            class: {
                id: string;
                isActive: boolean;
                name: string;
                tenantId: string;
                academicYearId: string;
            };
            section: {
                id: string;
                isActive: boolean;
                name: string;
                tenantId: string;
            };
        } & {
            id: string;
            tenantId: string;
            classId: string;
            sectionId: string;
            strength: number;
            teacherId: string | null;
        };
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
        status: string;
        createdAt: Date;
        classSectionId: string;
        subjectId: string;
        academicYearId: string;
        startTime: string;
        endTime: string;
        examName: string;
        createdBy: string;
        examDate: Date;
        examHall: string | null;
        instructions: string | null;
        duration: number;
    })[]>;
    findOne(id: string): Promise<{
        academicYear: {
            id: string;
            isActive: boolean;
            name: string;
            tenantId: string;
            startDate: Date;
            endDate: Date;
        };
        classSection: {
            class: {
                id: string;
                isActive: boolean;
                name: string;
                tenantId: string;
                academicYearId: string;
            };
            section: {
                id: string;
                isActive: boolean;
                name: string;
                tenantId: string;
            };
        } & {
            id: string;
            tenantId: string;
            classId: string;
            sectionId: string;
            strength: number;
            teacherId: string | null;
        };
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
        status: string;
        createdAt: Date;
        classSectionId: string;
        subjectId: string;
        academicYearId: string;
        startTime: string;
        endTime: string;
        examName: string;
        createdBy: string;
        examDate: Date;
        examHall: string | null;
        instructions: string | null;
        duration: number;
    }>;
    update(id: string, dto: UpdateExamScheduleDto): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        classSectionId: string;
        subjectId: string;
        academicYearId: string;
        startTime: string;
        endTime: string;
        examName: string;
        createdBy: string;
        examDate: Date;
        examHall: string | null;
        instructions: string | null;
        duration: number;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
