import { Controller, Get, Param, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get live dashboard summary & statistics' })
  async getDashboardSummary(@Request() req: any) {
    const tenantId = req?.user?.tenantId || req?.tenantId || req?.headers?.['x-tenant-id'] || 'tenant-test-001';
    return this.dashboardService.getDashboardSummary(tenantId);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get real-time reports analytics data' })
  async getReportsAnalytics(@Request() req: any) {
    const tenantId = req?.user?.tenantId || req?.tenantId || req?.headers?.['x-tenant-id'] || 'tenant-test-001';
    return this.dashboardService.getReportsAnalytics(tenantId);
  }

  @Get('reports/:type')
  @ApiOperation({ summary: 'Export reports analytics data by type' })
  async getReportsExportData(@Param('type') type: string, @Request() req: any) {
    const tenantId = req?.user?.tenantId || req?.tenantId || req?.headers?.['x-tenant-id'] || 'tenant-test-001';
    return this.dashboardService.getReportsExportData(type, tenantId);
  }
}
