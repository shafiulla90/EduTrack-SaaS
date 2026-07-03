import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, tenantId: user.tenantId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
      }
    };
  }

  async sendOtp(phone: string): Promise<{ success: boolean; message: string; otpCode?: string; schoolName?: string; logoUrl?: string }> {
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    const otpCode = process.env.NODE_ENV === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456'; // Static fallback for dev/testing

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.prisma.otpRequest.create({
      data: {
        phone: normalizedPhone,
        otpCode,
        expiresAt,
      },
    });

    console.log(`[OTP DISPATCH] Phone: ${phone} (Normalized: ${normalizedPhone}) | Code: ${otpCode}`);

    // Look up if there is a registered user with this phone → return their school branding
    let schoolName: string | undefined;
    let logoUrl: string | undefined;

    try {
      const user = await this.prisma.user.findFirst({
        where: { phone: { endsWith: normalizedPhone } },
        select: { tenantId: true },
      });

      if (user?.tenantId) {
        const [tenant, setup] = await Promise.all([
          this.prisma.tenant.findUnique({
            where: { id: user.tenantId },
            select: { name: true, logoUrl: true },
          }),
          this.prisma.schoolSetup.findUnique({
            where: { tenantId: user.tenantId },
            select: { schoolName: true, schoolLogo: true },
          }),
        ]);

        schoolName = setup?.schoolName || tenant?.name || undefined;
        logoUrl = setup?.schoolLogo || tenant?.logoUrl || undefined;
      }
    } catch (e) {
      // Non-critical — branding lookup failure should not block OTP
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      otpCode,
      ...(schoolName ? { schoolName } : {}),
      ...(logoUrl ? { logoUrl } : {}),
    };
  }

  async verifyOtp(phone: string, otpCode: string): Promise<any> {
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    const request = await this.prisma.otpRequest.findFirst({
      where: {
        phone: normalizedPhone,
        otpCode,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!request) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Clean up used OTP
    await this.prisma.otpRequest.delete({
      where: { id: request.id },
    }).catch(() => {}); // ignore cleanup error if any

    const user = await this.prisma.user.findFirst({
      where: {
        phone: {
          endsWith: normalizedPhone,
        },
      },
    });

    if (!user) {
      return {
        registered: false,
        phone,
      };
    }

    const loginResult = await this.login(user);
    return {
      registered: true,
      ...loginResult,
    };
  }

  async register(data: any, tenantId: string) {
    const emailLower = data.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await this.hashPassword(data.password);
    const normalizedPhone = data.phone ? data.phone.replace(/\D/g, '').slice(-10) : data.phone;
    
    // Create user and profile extensions within a single ACID database transaction
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailLower,
          passwordHash,
          name: data.name,
          role: data.role,
          phone: normalizedPhone,
          tenantId,
        },
      });

      if (data.role === Role.STUDENT) {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            rollNo: data.rollNo,
            fatherName: data.fatherName,
            motherName: data.motherName,
            aadharNo: data.aadharNo,
            classSectionId: data.classSectionId,
            tenantId,
          },
        });
      } else if (
        data.role === Role.TEACHER || 
        data.role === Role.STAFF || 
        data.role === Role.SCHOOL_ADMIN
      ) {
        await tx.staffProfile.create({
          data: {
            userId: user.id,
            employeeId: data.employeeId,
            designation: data.designation,
            basicSalary: data.basicSalary,
            allowances: data.allowances,
            deductions: data.deductions,
            pfDeduction: data.pfDeduction,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
            status: 'Active',
            qualification: data.qualification,
            subjectsTaught: data.subjectsTaught || [],
            tenantId,
          },
        });
      } else if (data.role === Role.PARENT) {
        await tx.parentProfile.create({
          data: {
            userId: user.id,
            emergencyContact: data.emergencyContact,
          },
        });
      }

      const { passwordHash: _, ...result } = user;
      return result;
    });
  }
}
