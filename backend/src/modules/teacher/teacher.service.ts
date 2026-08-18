import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ITeacherRepository } from '../../common/interfaces/teacher.repository.interface';
import { IUserRepository } from '../../common/interfaces/user.repository.interface';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherService {
  constructor(
    @Inject('ITeacherRepository') private readonly teacherRepo: ITeacherRepository,
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async create(tenantId: string, data: any) {
    if (!data.name && !data.email) {
      throw new BadRequestException('Name and email are required to create a staff member.');
    }

    // Determine role based on staffType
    const role = data.staffType === 'Non-Teaching' ? 'STAFF' : 'TEACHER';

    // Check if user with email already exists
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('A user with this email already exists.');
    }

    // Generate IDs
    const userId = randomUUID();
    const staffProfileId = randomUUID();

    // Hash a default password (phone or 'edutrack123')
    const defaultPassword = data.phone || 'edutrack123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // 1. Create User
    await this.userRepo.create({
      id: userId,
      email: data.email,
      passwordHash,
      name: data.name,
      role,
      phone: data.phone || null,
      isActive: true,
      tenantId,
      avatarUrl: data.avatarUrl || null,
      updatedAt: new Date(),
    });

    // 2. Create StaffProfile
    const safeJoiningDate = data.joiningDate && !isNaN(new Date(data.joiningDate).getTime())
      ? new Date(data.joiningDate)
      : new Date();

    await this.teacherRepo.createStaffProfile({
      id: staffProfileId,
      userId,
      tenantId,
      employeeId: data.employeeId || null,
      designation: data.designation || null,
      qualification: data.qualification || null,
      joiningDate: safeJoiningDate,
      status: data.status || 'Active',
      basicSalary: data.basicSalary !== undefined && data.basicSalary !== null && !isNaN(Number(data.basicSalary)) ? Number(data.basicSalary) : null,
      allowances: data.allowances !== undefined && data.allowances !== null && !isNaN(Number(data.allowances)) ? Number(data.allowances) : null,
      pfDeduction: data.pfDeduction !== undefined && data.pfDeduction !== null && !isNaN(Number(data.pfDeduction)) ? Number(data.pfDeduction) : null,
      subjectsTaught: Array.isArray(data.subjectsTaught) ? data.subjectsTaught : [],
    });

    return {
      id: staffProfileId,
      userId,
      name: data.name,
      role,
      staffType: data.staffType,
    };
  }

  async findAll(tenantId: string) {
    return this.teacherRepo.findTeachersByTenant(tenantId);
  }

  async findOne(id: string, tenantId: string) {
    return this.teacherRepo.findProfileById(id);
  }

  async update(id: string, tenantId: string, data: any) {
    // Update both the StaffProfile and User documents
    const profile = await this.teacherRepo.findProfileById(id);
    if (!profile) {
      throw new BadRequestException('Staff member not found.');
    }

    // Update the user record
    if (profile.userId) {
      const userUpdateData: any = {};
      if (data.name) userUpdateData.name = data.name;
      if (data.email) userUpdateData.email = data.email;
      if (data.phone) userUpdateData.phone = data.phone;
      if (data.avatarUrl !== undefined) userUpdateData.avatarUrl = data.avatarUrl;
      userUpdateData.updatedAt = new Date();

      await this.userRepo.update(profile.userId, userUpdateData);
    }

    // Update the staff profile
    await this.teacherRepo.updateStaffProfile(id, {
      employeeId: data.employeeId,
      designation: data.designation,
      qualification: data.qualification,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
      status: data.status,
      basicSalary: data.basicSalary ? Number(data.basicSalary) : undefined,
      allowances: data.allowances ? Number(data.allowances) : undefined,
      pfDeduction: data.pfDeduction ? Number(data.pfDeduction) : undefined,
      subjectsTaught: data.subjectsTaught,
    });

    return { success: true, id };
  }

  async remove(id: string, tenantId: string) {
    const profile = await this.teacherRepo.findProfileById(id);
    if (!profile) {
      throw new BadRequestException('Staff member not found.');
    }

    // Delete staff profile
    await this.teacherRepo.deleteStaffProfile(id);

    // Delete user account
    if (profile.userId) {
      await this.userRepo.delete(profile.userId);
    }

    return { success: true, id };
  }
}
