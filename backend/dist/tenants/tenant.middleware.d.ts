import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from './tenants.service';
export declare class TenantMiddleware implements NestMiddleware {
    private tenantsService;
    constructor(tenantsService: TenantsService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
