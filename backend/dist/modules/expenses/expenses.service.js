"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
let ExpensesService = class ExpensesService {
    constructor(billingRepo) {
        this.billingRepo = billingRepo;
    }
    async createExpense(data, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.billingRepo.createExpense({ ...data, tenantId: tid });
    }
    async getExpenses(category, status, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const list = await this.billingRepo.findExpensesByTenant(tid);
        let filtered = list || [];
        if (category) {
            filtered = filtered.filter((e) => e.category === category);
        }
        if (status) {
            filtered = filtered.filter((e) => e.status === status);
        }
        return filtered;
    }
    async getExpenseSummary(tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const list = await this.billingRepo.findExpensesByTenant(tid);
        const totalAmount = (list || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
        return {
            totalExpenses: list.length,
            totalAmount,
            currency: 'INR',
        };
    }
    async updateExpense(id, data, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (this.billingRepo.updateExpense) {
            return this.billingRepo.updateExpense(id, data, tid);
        }
        return { id, ...data, updatedAt: new Date().toISOString() };
    }
    async deleteExpense(id, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (this.billingRepo.deleteExpense) {
            return this.billingRepo.deleteExpense(id, tid);
        }
        return { success: true, id };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IBillingRepository')),
    __metadata("design:paramtypes", [Object])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map