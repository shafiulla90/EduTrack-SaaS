import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [StudentsService, PrismaService],
  controllers: [StudentsController],
  exports: [StudentsService],
})
export class StudentsModule {}
