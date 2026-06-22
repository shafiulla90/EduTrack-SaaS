import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ExamsService, PrismaService],
  controllers: [ExamsController],
  exports: [ExamsService],
})
export class ExamsModule {}
