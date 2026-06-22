import { Controller, Post, Get, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantContext } from './tenant.context';

@Controller('tenant')
export class TenantController {
  constructor(
    private tenantsService: TenantsService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    const required = [
      'schoolName',
      'schoolType',
      'adminName',
      'mobileNumber',
      'email',
      'address',
      'academicYear',
    ];

    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        throw new BadRequestException(`Field '${field}' is required for school registration`);
      }
    }

    // Register tenant and user
    const result = await this.tenantsService.registerTenant(body);

    // Automatically log in the user and return their session JWT token
    const loginResult = await this.authService.login(result.user);

    return {
      success: true,
      message: 'School registered successfully',
      ...loginResult,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('setup-status')
  async getSetupStatus(@Req() req: any) {
    const tenantId = req.user.tenantId;

    const setup = await this.prisma.schoolSetup.findUnique({
      where: { tenantId },
      include: { tenant: true },
    });

    if (!setup) {
      return {
        setupCompleted: false,
        completionPercentage: 0,
        classesCount: 0,
        teachersCount: 0,
        studentsCount: 0,
        missingFields: [
          'schoolName',
          'schoolType',
          'adminName',
          'mobileNumber',
          'email',
          'address',
          'academicYear',
        ],
      };
    }

    // Calculate profile completion percentage based on 13 total fields
    const fields = [
      setup.schoolName, setup.schoolType, setup.adminName, setup.mobileNumber,
      setup.email, setup.address, setup.academicYear, setup.principalName,
      setup.country, setup.state, setup.district, setup.city, setup.postalCode
    ];
    
    const filledCount = fields.filter(val => val && String(val).trim() !== '').length;
    const completionPercentage = Math.round((filledCount / fields.length) * 100);

    // Entity counts for setup progress metrics
    const classesCount = await this.prisma.class.count({
      where: { tenantId },
    });

    const teachersCount = await this.prisma.staffProfile.count({
      where: {
        user: { tenantId },
      },
    });

    const studentsCount = await this.prisma.studentProfile.count({
      where: {
        user: { tenantId },
      },
    });

    // Identify missing optional setup fields
    const missingFields: string[] = [];
    const checkFields = {
      principalName: setup.principalName,
      country: setup.country,
      state: setup.state,
      district: setup.district,
      city: setup.city,
      postalCode: setup.postalCode,
      schoolLogo: setup.schoolLogo,
    };

    for (const [key, val] of Object.entries(checkFields)) {
      if (!val || String(val).trim() === '') {
        missingFields.push(key);
      }
    }

    return {
      setupCompleted: setup.isCompleted,
      completionPercentage,
      classesCount,
      teachersCount,
      studentsCount,
      missingFields,
      setup,
    };
  }
}
