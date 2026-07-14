import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../common/storage.service';

@Module({
  providers: [StudentsService, PrismaService, StorageService],
  controllers: [StudentsController],
  exports: [StudentsService, StorageService],
})
export class StudentsModule {}
