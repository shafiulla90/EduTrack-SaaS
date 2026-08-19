import { TeacherService } from './teacher.service';
export declare class TeacherController {
    private readonly teacherService;
    constructor(teacherService: TeacherService);
    findAll(search?: string, role?: string, department?: string, req?: any): Promise<any[]>;
    payAllSalaries(body: any, req: any): Promise<{
        success: boolean;
        message: string;
        month: any;
    }>;
    paySalaryGeneric(body: any, req: any): Promise<{
        success: boolean;
        message: string;
        id: string;
        month: any;
        status: string;
    }>;
    paySalary(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        id: string;
        month: any;
        status: string;
    }>;
    paySalaryPatch(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        id: string;
        month: any;
        status: string;
    }>;
    getSalaryInvoices(id: string, req: any): Promise<{
        id: string;
        month: string;
        amount: number;
        status: string;
        paidAt: string;
    }[]>;
    getCases(id: string, req: any): Promise<any[]>;
    getSchedule(id: string, req: any): Promise<{
        day: string;
        period: string;
        class: string;
        subject: string;
    }[]>;
    findOne(id: string, req: any): Promise<any>;
    create(createDto: any, req: any): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        userId: `${string}-${string}-${string}-${string}-${string}`;
        name: any;
        role: string;
        staffType: any;
    }>;
    update(id: string, updateDto: any, req: any): Promise<{
        success: boolean;
        id: string;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
        id: string;
    }>;
}
