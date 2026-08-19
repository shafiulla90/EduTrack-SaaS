import { ITeacherRepository } from '../../common/interfaces/teacher.repository.interface';
import { IUserRepository } from '../../common/interfaces/user.repository.interface';
import { FirebaseService } from '../../database/firebase.service';
export declare class TeacherService {
    private readonly teacherRepo;
    private readonly userRepo;
    private readonly firebase?;
    constructor(teacherRepo: ITeacherRepository, userRepo: IUserRepository, firebase?: FirebaseService);
    create(tenantId: string, data: any): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        userId: `${string}-${string}-${string}-${string}-${string}`;
        name: any;
        role: string;
        staffType: any;
    }>;
    findAll(tenantId: string, filters?: any): Promise<any[]>;
    findOne(id: string, tenantId: string): Promise<any>;
    update(id: string, tenantId: string, data: any): Promise<{
        success: boolean;
        id: string;
    }>;
    remove(id: string, tenantId: string): Promise<{
        success: boolean;
        id: string;
    }>;
    paySalary(id: string, tenantId: string, data?: any): Promise<{
        success: boolean;
        message: string;
        id: string;
        month: any;
        status: string;
    }>;
    payAllSalaries(tenantId: string, data?: any): Promise<{
        success: boolean;
        message: string;
        month: any;
    }>;
    getSalaryInvoices(id: string, tenantId: string): Promise<{
        id: string;
        month: string;
        amount: number;
        status: string;
        paidAt: string;
    }[]>;
    getCases(id: string, tenantId: string): Promise<any[]>;
    getSchedule(id: string, tenantId: string): Promise<{
        day: string;
        period: string;
        class: string;
        subject: string;
    }[]>;
}
