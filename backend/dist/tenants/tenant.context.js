"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContext = void 0;
const async_hooks_1 = require("async_hooks");
class TenantContext {
    static run(tenantId, callback) {
        return this.storage.run({ tenantId }, callback);
    }
    static getTenantId() {
        const store = this.storage.getStore();
        return store ? store.tenantId : null;
    }
}
exports.TenantContext = TenantContext;
TenantContext.storage = new async_hooks_1.AsyncLocalStorage();
//# sourceMappingURL=tenant.context.js.map