import { Module, Global, forwardRef } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { TenantController } from './tenant.controller';
import { SchoolSetupController } from './school-setup.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [TenantsService, PrismaService],
  controllers: [TenantsController, TenantController, SchoolSetupController],
  exports: [TenantsService],
})
export class TenantsModule {}

