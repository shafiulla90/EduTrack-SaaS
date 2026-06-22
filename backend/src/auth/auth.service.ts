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
        role: user.role,
        tenantId: user.tenantId,
      }
    };
  }

  async sendOtp(phone: string): Promise<{ success: boolean; message: string; otpCode?: string }> {
    const otpCode = process.env.NODE_ENV === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456'; // Static fallback for dev/testing

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await this.prisma.otpRequest.create({
      data: {
        phone,
        otpCode,
        expiresAt,
      },
    });

    console.log(`[OTP DISPATCH] Phone: ${phone} | Code: ${otpCode}`);

    return {
      success: true,
      message: 'OTP sent successfully',
      otpCode,
    };
  }

  async verifyOtp(phone: string, otpCode: string): Promise<any> {
    const request = await this.prisma.otpRequest.findFirst({
      where: {
        phone,
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

    const user = await this.prisma.user.findUnique({
      where: { phone },
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
    
    // Create user and profile extensions within a single ACID database transaction
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailLower,
          passwordHash,
          name: data.name,
          role: data.role,
          phone: data.phone,
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
