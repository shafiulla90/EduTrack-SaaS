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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const client_1 = require("@prisma/client");
let ExpensesService = class ExpensesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found');
        }
        return tenantId;
    }
    async createExpense(data) {
        const tenantId = this.getTenantId();
        return this.prisma.expense.create({
            data: {
                amount: data.amount,
                category: data.category,
                date: new Date(data.date),
                description: data.description || null,
                paymentMode: data.paymentMode,
                status: data.status || client_1.ExpenseStatus.PENDING,
                tenantId,
            },
        });
    }
    async getExpenses(category, status) {
        const tenantId = this.getTenantId();
        return this.prisma.expense.findMany({
            where: {
                tenantId,
                ...(category ? { category } : {}),
                ...(status ? { status } : {}),
            },
            orderBy: { date: 'desc' },
        });
    }
    async deleteExpense(id) {
        const tenantId = this.getTenantId();
        const expense = await this.prisma.expense.findUnique({
            where: { id },
        });
        if (!expense || expense.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Expense record not found');
        }
        return this.prisma.expense.delete({
            where: { id },
        });
    }
    async updateExpense(id, data) {
        const tenantId = this.getTenantId();
        const expense = await this.prisma.expense.findUnique({
            where: { id },
        });
        if (!expense || expense.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Expense record not found');
        }
        return this.prisma.expense.update({
            where: { id },
            data: {
                amount: data.amount !== undefined ? data.amount : undefined,
                category: data.category !== undefined ? data.category : undefined,
                date: data.date !== undefined ? new Date(data.date) : undefined,
                description: data.description !== undefined ? data.description : undefined,
                paymentMode: data.paymentMode !== undefined ? data.paymentMode : undefined,
                status: data.status !== undefined ? data.status : undefined,
            },
        });
    }
    async getExpenseSummary() {
        const tenantId = this.getTenantId();
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const startOfPrevMonth = new Date(startOfMonth);
        startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);
        const startOfYear = new Date();
        startOfYear.setMonth(0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        const expenses = await this.prisma.expense.findMany({
            where: {
                tenantId,
                date: { gte: startOfPrevMonth },
            },
        });
        let currentMonthTotal = 0;
        let prevMonthTotal = 0;
        let yearlyTotal = 0;
        const now = new Date();
        for (const exp of expenses) {
            const amt = Number(exp.amount);
            const expDate = new Date(exp.date);
            if (expDate >= startOfMonth && expDate <= now) {
                currentMonthTotal += amt;
            }
            if (expDate >= startOfPrevMonth && expDate < startOfMonth) {
                prevMonthTotal += amt;
            }
            if (expDate >= startOfYear && expDate <= now) {
                yearlyTotal += amt;
            }
        }
        return {
            currentMonth: currentMonthTotal,
            prevMonth: prevMonthTotal,
            yearly: yearlyTotal,
        };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map