import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ISubscriptionRepository } from '../interfaces/subscription.repository.interface';
export declare class SubscriptionGuard implements CanActivate {
    private reflector;
    private readonly subRepo;
    constructor(reflector: Reflector, subRepo: ISubscriptionRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
