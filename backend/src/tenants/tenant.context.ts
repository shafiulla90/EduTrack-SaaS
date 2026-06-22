import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  tenantId: string;
}

export class TenantContext {
  private static storage = new AsyncLocalStorage<TenantStore>();

  static run(tenantId: string, callback: () => void) {
    this.storage.run({ tenantId }, callback);
  }

  static getTenantId(): string | null {
    const store = this.storage.getStore();
    return store ? store.tenantId : null;
  }
}
