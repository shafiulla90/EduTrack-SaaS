import { Module } from '@nestjs/common';
import { TeacherPortalController } from './teacher-portal.controller';
import { TeacherPortalService } from './teacher-portal.service';
import { PrismaService } from '../prisma.service';
import { AttendanceService } from '../attendance/attendance.service';
import { ExamsService } from '../exams/exams.service';

@Module({
  controllers: [TeacherPortalController],
  providers: [
    TeacherPortalService,
    PrismaService,
    AttendanceService,
    ExamsService,
  ],
})
export class TeacherPortalModule {}
