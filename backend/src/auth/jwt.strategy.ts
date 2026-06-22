import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenants/tenant.context';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'edutrack-super-secret-key-change-in-production-19823612',
    });
  }

  async validate(payload: any) {
    const activeTenantId = TenantContext.getTenantId();
    
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is disabled or does not exist');
    }
    
    // Enforce tenant boundary safety checks for multi-tenancy
    if (activeTenantId && user.tenantId !== activeTenantId && user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Unauthorized access: token tenant mismatch');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tenantId: user.tenantId,
    };
  }
}
