import { Request } from 'express';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { SupportService } from './support.service';
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    createSupport(dto: CreateSupportRequestDto, req: Request): Promise<{
        success: boolean;
        emailSent: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            schoolName: string;
            email: string;
            phone: string;
            subject: string;
            message: string;
            status: string;
            emailSent: boolean;
            createdAt: Date;
        };
    }>;
}
