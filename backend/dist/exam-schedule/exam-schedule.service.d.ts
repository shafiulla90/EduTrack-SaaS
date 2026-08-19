import { PrismaService } from '../prisma.service';
import { CommunicationsService } from '../communications/communications.service';
import { CreateExamScheduleDto, UpdateExamScheduleDto, BulkCreateDto, BulkStatusDto, BulkDeleteDto } from './dto/exam-schedule.dto';
export declare class ExamScheduleService {
    private prisma;
    private communicationsService;
    constructor(prisma: PrismaService, communicationsService: CommunicationsService);
    private getTenantId;
    private parseTimeToMinutes;
    private validateSchedule;
    private notifyTeachers;
    create(dto: CreateExamScheduleDto, userId: string): Promise<{
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
    createBulk(dto: BulkCreateDto, userId: string): Promise<any[]>;
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
    updateBulk(dto: BulkStatusDto): Promise<any[]>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    deleteBulk(dto: BulkDeleteDto): Promise<{
        success: boolean;
    }>;
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
    findAll(query: any, user: any): Promise<({
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
}
