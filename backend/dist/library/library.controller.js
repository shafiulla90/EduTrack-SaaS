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
exports.LibraryController = void 0;
const common_1 = require("@nestjs/common");
const library_service_1 = require("./library.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let LibraryController = class LibraryController {
    constructor(libraryService) {
        this.libraryService = libraryService;
    }
    async createBook(data) {
        return this.libraryService.addBook(data);
    }
    async getBooks() {
        return this.libraryService.getBooks();
    }
    async borrow(barcode, borrowerId, daysToBorrow) {
        return this.libraryService.borrowBook(barcode, borrowerId, daysToBorrow);
    }
    async returnBook(barcode, finePaid) {
        return this.libraryService.returnBook(barcode, finePaid);
    }
    async getLogs() {
        return this.libraryService.getBorrowLogs();
    }
};
exports.LibraryController = LibraryController;
__decorate([
    (0, common_1.Post)('books'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "createBook", null);
__decorate([
    (0, common_1.Get)('books'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "getBooks", null);
__decorate([
    (0, common_1.Post)('borrow'),
    __param(0, (0, common_1.Body)('barcode')),
    __param(1, (0, common_1.Body)('borrowerId')),
    __param(2, (0, common_1.Body)('daysToBorrow')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "borrow", null);
__decorate([
    (0, common_1.Post)('return'),
    __param(0, (0, common_1.Body)('barcode')),
    __param(1, (0, common_1.Body)('finePaid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "returnBook", null);
__decorate([
    (0, common_1.Get)('borrow-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LibraryController.prototype, "getLogs", null);
exports.LibraryController = LibraryController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('library'),
    __metadata("design:paramtypes", [library_service_1.LibraryService])
], LibraryController);
//# sourceMappingURL=library.controller.js.map