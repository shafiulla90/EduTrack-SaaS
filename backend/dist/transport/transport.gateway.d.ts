import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { TransportService } from './transport.service';
export declare class TransportTrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    private readonly prisma;
    private readonly transportService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, prisma: PrismaService, transportService: TransportService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleDriverGpsUpdate(client: Socket, data: {
        busId: string;
        tripId: string;
        latitude: number;
        longitude: number;
        speed: number;
        heading: number;
    }): Promise<void>;
    handleJoinBusRoom(client: Socket, data: {
        busId: string;
    }): Promise<void>;
    handleLeaveBusRoom(client: Socket, data: {
        busId: string;
    }): void;
    handleJoinAdminTracking(client: Socket): void;
}
