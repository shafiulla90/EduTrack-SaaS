import { FirebaseService } from '../../firebase.service';
import { ISubscriptionRepository } from '../../../common/interfaces/subscription.repository.interface';
export declare class FirestoreSubscriptionRepository implements ISubscriptionRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    findPlans(): Promise<any[]>;
    findPlanById(id: string): Promise<any | null>;
    createOrder(data: any): Promise<any>;
    findOrderById(id: string): Promise<any | null>;
    createPayment(data: any): Promise<any>;
    createSubscription(data: any): Promise<any>;
    findActiveSubscription(tenantId: string): Promise<any | null>;
}
