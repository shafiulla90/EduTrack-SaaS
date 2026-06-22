import { Module, Global } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PrismaService } from '../prisma.service';

@Global()
@Module({
  providers: [TenantsService, PrismaService],
  controllers: [TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {}
