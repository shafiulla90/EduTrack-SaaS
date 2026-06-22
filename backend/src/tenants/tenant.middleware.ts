import { Injectable, NestMiddleware, BadRequestException, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from './tenants.service';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let tenantSubdomain = '';

    // 1. Resolve from X-Tenant-ID header (highly reliable for SPA client REST API calls)
    const headerTenant = req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'];
    if (headerTenant) {
      tenantSubdomain = String(headerTenant).trim();
    } else {
      // 2. Resolve from subdomain of hostname (e.g. school1.edutrack.com -> school1)
      const hostname = req.hostname;
      const hostParts = hostname.split('.');
      if (hostParts.length > 2 && hostParts[0] !== 'www' && hostParts[0] !== 'localhost') {
        tenantSubdomain = hostParts[0];
      }
    }

    // 3. Fallback to query parameter (e.g. ?tenant=school1)
    if (!tenantSubdomain && req.query.tenant) {
      tenantSubdomain = String(req.query.tenant).trim();
    }

    if (!tenantSubdomain) {
      // For localhost testing, we can fall back to the first available tenant
      // to avoid breaking local dev server APIs, or raise an error.
      try {
        const allTenants = await this.tenantsService.findAll();
        if (allTenants.length > 0) {
          // Fall back to first tenant for development if no header is supplied
          const defaultTenant = allTenants[0];
          TenantContext.run(defaultTenant.id, () => {
            req['tenantId'] = defaultTenant.id;
            next();
          });
          return;
        }
      } catch (e) {
        // Fallback failed
      }
      throw new BadRequestException('X-Tenant-ID header or subdomain is required');
    }

    try {
      // Search by subdomain
      const tenant = await this.tenantsService.findBySubdomain(tenantSubdomain);
      TenantContext.run(tenant.id, () => {
        req['tenantId'] = tenant.id;
        next();
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        // If not found as subdomain, try if it was a raw UUID ID
        try {
          const tenant = await this.tenantsService.findById(tenantSubdomain);
          TenantContext.run(tenant.id, () => {
            req['tenantId'] = tenant.id;
            next();
          });
          return;
        } catch (e) {
          // If still not found, throw error
        }
      }
      throw new BadRequestException(`Tenant resolution failed: ${error.message}`);
    }
  }
}
