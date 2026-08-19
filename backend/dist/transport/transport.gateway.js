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
var TransportTrackingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportTrackingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const transport_service_1 = require("./transport.service");
let TransportTrackingGateway = TransportTrackingGateway_1 = class TransportTrackingGateway {
    constructor(jwtService, configService, prisma, transportService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
        this.transportService = transportService;
        this.logger = new common_1.Logger(TransportTrackingGateway_1.name);
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const secret = this.configService.get('JWT_SECRET') || 'edutrack-super-secret-key-change-in-production-19823612';
            const payload = this.jwtService.verify(token, { secret });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || !user.isActive) {
                client.disconnect();
                return;
            }
            client.user = user;
            this.logger.log(`Client connected: ${client.id} (User: ${user.id})`);
        }
        catch (err) {
            this.logger.warn(`Invalid connection attempt: ${client.id}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleDriverGpsUpdate(client, data) {
        const user = client.user;
        if (!user)
            return;
        if (!['DRIVER', 'TEACHER', 'SUPER_ADMIN'].includes(user.role))
            return;
        const processedUpdate = await this.transportService.processDriverGps(user.id, user.tenantId, {
            ...data,
            lat: data.latitude,
            lng: data.longitude,
        });
        this.server.to(`bus_${data.busId}`).emit('busLocationUpdate', processedUpdate);
        this.server.to('admin_tracking').emit('adminBusLocationUpdate', processedUpdate);
    }
    async handleJoinBusRoom(client, data) {
        const user = client.user;
        if (!user)
            return;
        if (user.role === 'PARENT') {
            const parentProfile = await this.prisma.parentProfile.findUnique({
                where: { userId: user.id },
                include: { students: { select: { busId: true } } },
            });
            const hasChildOnBus = parentProfile?.students.some(child => child.busId === data.busId);
            if (!hasChildOnBus) {
                this.logger.warn(`Parent ${user.id} attempted to join unauthorized bus room ${data.busId}`);
                return;
            }
        }
        const room = `bus_${data.busId}`;
        client.join(room);
        this.logger.log(`User ${user.id} joined room ${room}`);
        const busInfo = await this.prisma.bus.findUnique({
            where: { id: data.busId },
            select: { currentLat: true, currentLng: true, currentSpeed: true, currentHeading: true, dutyStatus: true, lastGpsUpdate: true }
        });
        if (busInfo) {
            client.emit('busLocationUpdate', busInfo);
        }
    }
    handleLeaveBusRoom(client, data) {
        client.leave(`bus_${data.busId}`);
    }
    handleJoinAdminTracking(client) {
        const user = client.user;
        if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'SCHOOL_ADMIN')
            return;
        client.join('admin_tracking');
    }
};
exports.TransportTrackingGateway = TransportTrackingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TransportTrackingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('driverGpsUpdate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], TransportTrackingGateway.prototype, "handleDriverGpsUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinBusRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], TransportTrackingGateway.prototype, "handleJoinBusRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveBusRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TransportTrackingGateway.prototype, "handleLeaveBusRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinAdminTracking'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TransportTrackingGateway.prototype, "handleJoinAdminTracking", null);
exports.TransportTrackingGateway = TransportTrackingGateway = TransportTrackingGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/transport-live',
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService,
        transport_service_1.TransportService])
], TransportTrackingGateway);
//# sourceMappingURL=transport.gateway.js.map