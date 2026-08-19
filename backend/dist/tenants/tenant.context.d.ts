export interface TenantStore {
    tenantId: string;
}
export declare class TenantContext {
    private static storage;
    static run<T>(tenantId: string, callback: () => T): T;
    static getTenantId(): string | null;
}
