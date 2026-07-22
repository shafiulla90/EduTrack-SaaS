import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

  async sendOtp(phone: string, portal?: string): Promise<any> {
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);

    // If portal parameter is provided, validate role match before dispatching OTP
    if (portal) {
      const users = await this.prisma.user.findMany({
        where: { phone: { endsWith: normalizedPhone } }
      });

      const matchingStudents = await this.prisma.studentProfile.findMany({
        where: {
          OR: [
            { user: { phone: { endsWith: normalizedPhone } } },
            { fatherPhone: { endsWith: normalizedPhone } },
            { motherPhone: { endsWith: normalizedPhone } },
            { guardianPhone: { endsWith: normalizedPhone } }
          ]
        }
      });

      const isAdmin = users.some(u => u.role === Role.SCHOOL_ADMIN || u.role === Role.ADMIN);
      const isTeacher = users.some(u => u.role === Role.TEACHER || u.role === Role.STAFF);
      const isParent = users.some(u => u.role === Role.PARENT) || matchingStudents.length > 0;
      const userExists = users.length > 0 || matchingStudents.length > 0;

      const p = portal.toLowerCase();

      if (p === 'admin') {
        if (userExists && !isAdmin) {
          throw new BadRequestException('This mobile number is not authorized for the selected portal. Please log in through the appropriate portal.');
        }
        if (!userExists) {
          return {
            success: false,
            notFound: true,
            redirectToRegister: true,
            message: 'School Administrator account not found. Redirecting to School Registration page...'
          };
        }
      } else if (p === 'teacher') {
        if (userExists && !isTeacher) {
          throw new BadRequestException('This mobile number is not authorized for the selected portal. Please log in through the appropriate portal.');
        }
        if (!userExists || !isTeacher) {
          return {
            success: false,
            notFound: true,
            portal: 'teacher',
            message: 'Teacher account not found. Please contact your School Administrator to obtain Teacher Portal access.'
          };
        }
      } else if (p === 'parent' || p === 'student') {
        if (userExists && !isParent) {
          throw new BadRequestException('This mobile number is not authorized for the selected portal. Please log in through the appropriate portal.');
        }
        if (!userExists || !isParent) {
          return {
            success: false,
            notFound: true,
            portal: 'parent',
            message: 'Parent account not found. Please contact your School Administrator to obtain Parent Portal access.'
          };
        }
      }
    }

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

  async verifyOtp(phone: string, otpCode: string, portal?: string): Promise<any> {
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

    // --- AUTO-ASSOCIATION FOR PARENTS AND STUDENTS ---
    // Search for students linked to this phone number
    const matchingStudents = await this.prisma.studentProfile.findMany({
      where: {
        OR: [
          { user: { phone: { endsWith: normalizedPhone } } },
          { fatherPhone: { endsWith: normalizedPhone } },
          { motherPhone: { endsWith: normalizedPhone } },
          { guardianPhone: { endsWith: normalizedPhone } }
        ]
      },
      include: {
        user: true
      }
    });

    let parentUser = await this.prisma.user.findFirst({
      where: {
        role: Role.PARENT,
        phone: { endsWith: normalizedPhone }
      },
      include: {
        parentProfile: true
      }
    });

    if (matchingStudents.length > 0) {
      const firstStudent = matchingStudents[0];
      const tenantId = firstStudent.tenantId;

      if (!parentUser) {
        const parentName = firstStudent.fatherName || firstStudent.motherName || `Parent of ${firstStudent.user.name}`;
        const parentEmail = `parent.${normalizedPhone}@edutrack.local`;
        const passwordHash = await bcrypt.hash('Welcome@123', 10);
        const parentPhone = `${tenantId.substring(0, 8)}-${normalizedPhone}`;

        parentUser = await this.prisma.$transaction(async (tx) => {
          let existing = await tx.user.findFirst({
            where: {
              OR: [
                { email: parentEmail },
                { phone: parentPhone, role: Role.PARENT }
              ]
            },
            include: { parentProfile: true }
          });
          if (existing) return existing;

          const user = await tx.user.create({
            data: {
              email: parentEmail,
              name: parentName,
              passwordHash,
              role: Role.PARENT,
              phone: parentPhone,
              tenantId,
            }
          });

          const profile = await tx.parentProfile.create({
            data: {
              userId: user.id,
            }
          });

          return {
            ...user,
            parentProfile: profile
          } as any;
        });
      }

      // Link students to the parent profile
      if (parentUser && parentUser.parentProfile) {
        for (const student of matchingStudents) {
          let relationship = "Guardian";
          if (student.fatherPhone && student.fatherPhone.replace(/\D/g, '').endsWith(normalizedPhone)) {
            relationship = "Father";
          } else if (student.motherPhone && student.motherPhone.replace(/\D/g, '').endsWith(normalizedPhone)) {
            relationship = "Mother";
          }

          await this.prisma.parentStudent.upsert({
            where: {
              parentId_studentId: {
                parentId: parentUser.parentProfile.id,
                studentId: student.id
              }
            },
            update: {},
            create: {
              parentId: parentUser.parentProfile.id,
              studentId: student.id,
              relationship,
              isPrimary: true
            }
          }).catch(() => {});

          // Also set legacy field for backward compatibility
          if (student.parentProfileId !== parentUser.parentProfile.id) {
            await this.prisma.studentProfile.update({
              where: { id: student.id },
              data: { parentProfileId: parentUser.parentProfile.id }
            }).catch(() => {});
          }
        }
      }
    }

    // Determine target role based on selected portal
    let user: any = null;

    if (portal) {
      const p = portal.toLowerCase();
      if (p === 'parent' || p === 'student') {
        user = await this.prisma.user.findFirst({
          where: {
            phone: { endsWith: normalizedPhone },
            role: Role.PARENT
          },
        });
      } else if (p === 'teacher') {
        user = await this.prisma.user.findFirst({
          where: {
            phone: { endsWith: normalizedPhone },
            role: { in: [Role.TEACHER, Role.STAFF] }
          },
        });
      } else if (p === 'admin') {
        user = await this.prisma.user.findFirst({
          where: {
            phone: { endsWith: normalizedPhone },
            role: { in: [Role.SCHOOL_ADMIN, Role.ADMIN] }
          },
        });
      }
    }

    if (!user) {
      // Fallback role selection
      user = await this.prisma.user.findFirst({
        where: {
          phone: { endsWith: normalizedPhone }
        },
      });
    }

    if (!user) {
      if (portal && portal.toLowerCase() !== 'admin') {
        throw new BadRequestException('Account not found for the selected portal. Please contact your School Administrator.');
      }
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
