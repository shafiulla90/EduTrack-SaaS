import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  async getDashboardSummary() {
    return this.dashboardService.getDashboardSummary();
  }

  @Get('reports')
  async getReportsSummary() {
    return this.dashboardService.getReportsSummary();
  }

  @Get('reports/demographics')
  async getDemographicsReport() {
    return this.dashboardService.getDemographicsReport();
  }

  @Get('reports/cashflows')
  async getCashflowsReport() {
    return this.dashboardService.getCashflowsReport();
  }

  @Get('reports/grading')
  async getGradingReport() {
    return this.dashboardService.getGradingReport();
  }
}
