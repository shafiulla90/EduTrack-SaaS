import { PrismaService } from '../prisma.service';
export declare class TransportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getBuses(tenantId: string): Promise<({
        students: {
            user: {
                name: string;
            };
            id: string;
            rollNo: string;
        }[];
        route: {
            stops: {
                id: string;
                updatedAt: Date;
                createdAt: Date;
                pickupTime: string | null;
                dropTime: string | null;
                routeId: string;
                sequenceOrder: number;
                stopName: string;
                lat: number;
                lng: number;
            }[];
        } & {
            id: string;
            updatedAt: Date;
            tenantId: string;
            createdAt: Date;
            description: string | null;
            routeName: string;
            startPoint: string | null;
            endPoint: string | null;
        };
        driver: {
            user: {
                name: string;
                email: string;
                phone: string;
                avatarUrl: string;
            };
        } & {
            id: string;
            tenantId: string;
            status: string | null;
            address: string | null;
            userId: string;
            employeeId: string | null;
            designation: string | null;
            basicSalary: import("@prisma/client/runtime/library").Decimal | null;
            allowances: import("@prisma/client/runtime/library").Decimal | null;
            deductions: import("@prisma/client/runtime/library").Decimal | null;
            pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
            joiningDate: Date | null;
            qualification: string | null;
            subjectsTaught: string[];
            staffCategory: string | null;
            staffRole: string | null;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            experienceYears: number | null;
            bloodGroup: string | null;
            aadhaarNo: string | null;
            whatsappNumber: string | null;
            emergencyContact: string | null;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        busNumber: string;
        registrationNo: string;
        vehicleModel: string | null;
        capacity: number;
        busPhotoUrl: string | null;
        pickupTime: string | null;
        dropTime: string | null;
        dutyStatus: string;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        currentHeading: number | null;
        lastGpsUpdate: Date | null;
        batteryLevel: number | null;
        driverId: string | null;
        routeId: string | null;
    })[]>;
    createBus(tenantId: string, dto: any): Promise<{
        route: {
            stops: {
                id: string;
                updatedAt: Date;
                createdAt: Date;
                pickupTime: string | null;
                dropTime: string | null;
                routeId: string;
                sequenceOrder: number;
                stopName: string;
                lat: number;
                lng: number;
            }[];
        } & {
            id: string;
            updatedAt: Date;
            tenantId: string;
            createdAt: Date;
            description: string | null;
            routeName: string;
            startPoint: string | null;
            endPoint: string | null;
        };
        driver: {
            user: {
                id: string;
                isActive: boolean;
                updatedAt: Date;
                name: string;
                tenantId: string;
                createdAt: Date;
                email: string | null;
                phone: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            tenantId: string;
            status: string | null;
            address: string | null;
            userId: string;
            employeeId: string | null;
            designation: string | null;
            basicSalary: import("@prisma/client/runtime/library").Decimal | null;
            allowances: import("@prisma/client/runtime/library").Decimal | null;
            deductions: import("@prisma/client/runtime/library").Decimal | null;
            pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
            joiningDate: Date | null;
            qualification: string | null;
            subjectsTaught: string[];
            staffCategory: string | null;
            staffRole: string | null;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            experienceYears: number | null;
            bloodGroup: string | null;
            aadhaarNo: string | null;
            whatsappNumber: string | null;
            emergencyContact: string | null;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        busNumber: string;
        registrationNo: string;
        vehicleModel: string | null;
        capacity: number;
        busPhotoUrl: string | null;
        pickupTime: string | null;
        dropTime: string | null;
        dutyStatus: string;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        currentHeading: number | null;
        lastGpsUpdate: Date | null;
        batteryLevel: number | null;
        driverId: string | null;
        routeId: string | null;
    }>;
    updateBus(tenantId: string, busId: string, dto: any): Promise<{
        route: {
            stops: {
                id: string;
                updatedAt: Date;
                createdAt: Date;
                pickupTime: string | null;
                dropTime: string | null;
                routeId: string;
                sequenceOrder: number;
                stopName: string;
                lat: number;
                lng: number;
            }[];
        } & {
            id: string;
            updatedAt: Date;
            tenantId: string;
            createdAt: Date;
            description: string | null;
            routeName: string;
            startPoint: string | null;
            endPoint: string | null;
        };
        driver: {
            user: {
                id: string;
                isActive: boolean;
                updatedAt: Date;
                name: string;
                tenantId: string;
                createdAt: Date;
                email: string | null;
                phone: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            tenantId: string;
            status: string | null;
            address: string | null;
            userId: string;
            employeeId: string | null;
            designation: string | null;
            basicSalary: import("@prisma/client/runtime/library").Decimal | null;
            allowances: import("@prisma/client/runtime/library").Decimal | null;
            deductions: import("@prisma/client/runtime/library").Decimal | null;
            pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
            joiningDate: Date | null;
            qualification: string | null;
            subjectsTaught: string[];
            staffCategory: string | null;
            staffRole: string | null;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            experienceYears: number | null;
            bloodGroup: string | null;
            aadhaarNo: string | null;
            whatsappNumber: string | null;
            emergencyContact: string | null;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        busNumber: string;
        registrationNo: string;
        vehicleModel: string | null;
        capacity: number;
        busPhotoUrl: string | null;
        pickupTime: string | null;
        dropTime: string | null;
        dutyStatus: string;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        currentHeading: number | null;
        lastGpsUpdate: Date | null;
        batteryLevel: number | null;
        driverId: string | null;
        routeId: string | null;
    }>;
    deleteBus(tenantId: string, busId: string): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        busNumber: string;
        registrationNo: string;
        vehicleModel: string | null;
        capacity: number;
        busPhotoUrl: string | null;
        pickupTime: string | null;
        dropTime: string | null;
        dutyStatus: string;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        currentHeading: number | null;
        lastGpsUpdate: Date | null;
        batteryLevel: number | null;
        driverId: string | null;
        routeId: string | null;
    }>;
    getDrivers(tenantId: string): Promise<({
        user: {
            id: string;
            isActive: boolean;
            name: string;
            email: string;
            phone: string;
            avatarUrl: string;
        };
        assignedBus: {
            id: string;
            busNumber: string;
            registrationNo: string;
            dutyStatus: string;
        };
    } & {
        id: string;
        tenantId: string;
        status: string | null;
        address: string | null;
        userId: string;
        employeeId: string | null;
        designation: string | null;
        basicSalary: import("@prisma/client/runtime/library").Decimal | null;
        allowances: import("@prisma/client/runtime/library").Decimal | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
        joiningDate: Date | null;
        qualification: string | null;
        subjectsTaught: string[];
        staffCategory: string | null;
        staffRole: string | null;
        licenseNumber: string | null;
        licenseExpiry: Date | null;
        experienceYears: number | null;
        bloodGroup: string | null;
        aadhaarNo: string | null;
        whatsappNumber: string | null;
        emergencyContact: string | null;
    })[]>;
    createDriver(tenantId: string, dto: any): Promise<{
        user: {
            id: string;
            isActive: boolean;
            updatedAt: Date;
            name: string;
            tenantId: string;
            createdAt: Date;
            email: string | null;
            phone: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        status: string | null;
        address: string | null;
        userId: string;
        employeeId: string | null;
        designation: string | null;
        basicSalary: import("@prisma/client/runtime/library").Decimal | null;
        allowances: import("@prisma/client/runtime/library").Decimal | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
        joiningDate: Date | null;
        qualification: string | null;
        subjectsTaught: string[];
        staffCategory: string | null;
        staffRole: string | null;
        licenseNumber: string | null;
        licenseExpiry: Date | null;
        experienceYears: number | null;
        bloodGroup: string | null;
        aadhaarNo: string | null;
        whatsappNumber: string | null;
        emergencyContact: string | null;
    }>;
    updateDriver(tenantId: string, driverId: string, dto: any): Promise<{
        user: {
            id: string;
            isActive: boolean;
            updatedAt: Date;
            name: string;
            tenantId: string;
            createdAt: Date;
            email: string | null;
            phone: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string | null;
        };
        assignedBus: {
            id: string;
            updatedAt: Date;
            tenantId: string;
            status: string;
            createdAt: Date;
            busNumber: string;
            registrationNo: string;
            vehicleModel: string | null;
            capacity: number;
            busPhotoUrl: string | null;
            pickupTime: string | null;
            dropTime: string | null;
            dutyStatus: string;
            currentLat: number | null;
            currentLng: number | null;
            currentSpeed: number | null;
            currentHeading: number | null;
            lastGpsUpdate: Date | null;
            batteryLevel: number | null;
            driverId: string | null;
            routeId: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        status: string | null;
        address: string | null;
        userId: string;
        employeeId: string | null;
        designation: string | null;
        basicSalary: import("@prisma/client/runtime/library").Decimal | null;
        allowances: import("@prisma/client/runtime/library").Decimal | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
        joiningDate: Date | null;
        qualification: string | null;
        subjectsTaught: string[];
        staffCategory: string | null;
        staffRole: string | null;
        licenseNumber: string | null;
        licenseExpiry: Date | null;
        experienceYears: number | null;
        bloodGroup: string | null;
        aadhaarNo: string | null;
        whatsappNumber: string | null;
        emergencyContact: string | null;
    }>;
    deleteDriver(tenantId: string, driverId: string): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        name: string;
        tenantId: string;
        createdAt: Date;
        email: string | null;
        phone: string | null;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string | null;
    }>;
    getRoutes(tenantId: string): Promise<({
        buses: {
            id: string;
            busNumber: string;
            registrationNo: string;
        }[];
        stops: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            pickupTime: string | null;
            dropTime: string | null;
            routeId: string;
            sequenceOrder: number;
            stopName: string;
            lat: number;
            lng: number;
        }[];
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        routeName: string;
        startPoint: string | null;
        endPoint: string | null;
    })[]>;
    createRoute(tenantId: string, dto: any): Promise<{
        stops: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            pickupTime: string | null;
            dropTime: string | null;
            routeId: string;
            sequenceOrder: number;
            stopName: string;
            lat: number;
            lng: number;
        }[];
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        routeName: string;
        startPoint: string | null;
        endPoint: string | null;
    }>;
    addBusStop(tenantId: string, routeId: string, dto: any): Promise<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        pickupTime: string | null;
        dropTime: string | null;
        routeId: string;
        sequenceOrder: number;
        stopName: string;
        lat: number;
        lng: number;
    }>;
    deleteBusStop(tenantId: string, stopId: string): Promise<{
        id: string;
        updatedAt: Date;
        createdAt: Date;
        pickupTime: string | null;
        dropTime: string | null;
        routeId: string;
        sequenceOrder: number;
        stopName: string;
        lat: number;
        lng: number;
    }>;
    getStudentAssignments(tenantId: string): Promise<{
        user: {
            name: string;
            phone: string;
        };
        classSection: {
            class: {
                name: string;
            };
            section: {
                name: string;
            };
        };
        bus: {
            id: string;
            busNumber: string;
            registrationNo: string;
        };
        busStop: {
            id: string;
            pickupTime: string;
            dropTime: string;
            stopName: string;
        };
        id: string;
        rollNo: string;
        busId: string;
        busStopId: string;
    }[]>;
    assignStudentBus(tenantId: string, dto: {
        studentId: string;
        busId: string | null;
        busStopId: string | null;
    }): Promise<{
        bus: {
            id: string;
            updatedAt: Date;
            tenantId: string;
            status: string;
            createdAt: Date;
            busNumber: string;
            registrationNo: string;
            vehicleModel: string | null;
            capacity: number;
            busPhotoUrl: string | null;
            pickupTime: string | null;
            dropTime: string | null;
            dutyStatus: string;
            currentLat: number | null;
            currentLng: number | null;
            currentSpeed: number | null;
            currentHeading: number | null;
            lastGpsUpdate: Date | null;
            batteryLevel: number | null;
            driverId: string | null;
            routeId: string | null;
        };
        busStop: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            pickupTime: string | null;
            dropTime: string | null;
            routeId: string;
            sequenceOrder: number;
            stopName: string;
            lat: number;
            lng: number;
        };
    } & {
        id: string;
        tenantId: string;
        userId: string;
        rollNo: string | null;
        fatherName: string | null;
        motherName: string | null;
        aadharNo: string | null;
        profilePhotoUrl: string | null;
        fatherPhone: string | null;
        motherPhone: string | null;
        guardianPhone: string | null;
        parentProfileId: string | null;
        classSectionId: string | null;
        busId: string | null;
        busStopId: string | null;
    }>;
    getAdminDashboard(tenantId: string): Promise<{
        kpis: {
            totalBuses: number;
            activeBuses: number;
            busesRunning: number;
            driversOnDuty: number;
            offlineDrivers: number;
            gpsNotUpdating: number;
            studentsAssigned: number;
            routesRunning: number;
            delayedBuses: number;
        };
        buses: ({
            students: {
                id: string;
            }[];
            route: {
                stops: {
                    id: string;
                    updatedAt: Date;
                    createdAt: Date;
                    pickupTime: string | null;
                    dropTime: string | null;
                    routeId: string;
                    sequenceOrder: number;
                    stopName: string;
                    lat: number;
                    lng: number;
                }[];
            } & {
                id: string;
                updatedAt: Date;
                tenantId: string;
                createdAt: Date;
                description: string | null;
                routeName: string;
                startPoint: string | null;
                endPoint: string | null;
            };
            driver: {
                user: {
                    name: string;
                    phone: string;
                };
            } & {
                id: string;
                tenantId: string;
                status: string | null;
                address: string | null;
                userId: string;
                employeeId: string | null;
                designation: string | null;
                basicSalary: import("@prisma/client/runtime/library").Decimal | null;
                allowances: import("@prisma/client/runtime/library").Decimal | null;
                deductions: import("@prisma/client/runtime/library").Decimal | null;
                pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
                joiningDate: Date | null;
                qualification: string | null;
                subjectsTaught: string[];
                staffCategory: string | null;
                staffRole: string | null;
                licenseNumber: string | null;
                licenseExpiry: Date | null;
                experienceYears: number | null;
                bloodGroup: string | null;
                aadhaarNo: string | null;
                whatsappNumber: string | null;
                emergencyContact: string | null;
            };
        } & {
            id: string;
            updatedAt: Date;
            tenantId: string;
            status: string;
            createdAt: Date;
            busNumber: string;
            registrationNo: string;
            vehicleModel: string | null;
            capacity: number;
            busPhotoUrl: string | null;
            pickupTime: string | null;
            dropTime: string | null;
            dutyStatus: string;
            currentLat: number | null;
            currentLng: number | null;
            currentSpeed: number | null;
            currentHeading: number | null;
            lastGpsUpdate: Date | null;
            batteryLevel: number | null;
            driverId: string | null;
            routeId: string | null;
        })[];
    }>;
    getDriverAssignedBus(userId: string, tenantId: string): Promise<{
        driver: {
            user: {
                id: string;
                isActive: boolean;
                updatedAt: Date;
                name: string;
                tenantId: string;
                createdAt: Date;
                email: string | null;
                phone: string | null;
                passwordHash: string;
                role: import(".prisma/client").$Enums.Role;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            tenantId: string;
            status: string | null;
            address: string | null;
            userId: string;
            employeeId: string | null;
            designation: string | null;
            basicSalary: import("@prisma/client/runtime/library").Decimal | null;
            allowances: import("@prisma/client/runtime/library").Decimal | null;
            deductions: import("@prisma/client/runtime/library").Decimal | null;
            pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
            joiningDate: Date | null;
            qualification: string | null;
            subjectsTaught: string[];
            staffCategory: string | null;
            staffRole: string | null;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            experienceYears: number | null;
            bloodGroup: string | null;
            aadhaarNo: string | null;
            whatsappNumber: string | null;
            emergencyContact: string | null;
        };
        bus: {
            students: {
                user: {
                    name: string;
                    phone: string;
                };
                busStop: {
                    pickupTime: string;
                    stopName: string;
                };
                id: string;
                rollNo: string;
            }[];
            route: {
                stops: {
                    id: string;
                    updatedAt: Date;
                    createdAt: Date;
                    pickupTime: string | null;
                    dropTime: string | null;
                    routeId: string;
                    sequenceOrder: number;
                    stopName: string;
                    lat: number;
                    lng: number;
                }[];
            } & {
                id: string;
                updatedAt: Date;
                tenantId: string;
                createdAt: Date;
                description: string | null;
                routeName: string;
                startPoint: string | null;
                endPoint: string | null;
            };
        } & {
            id: string;
            updatedAt: Date;
            tenantId: string;
            status: string;
            createdAt: Date;
            busNumber: string;
            registrationNo: string;
            vehicleModel: string | null;
            capacity: number;
            busPhotoUrl: string | null;
            pickupTime: string | null;
            dropTime: string | null;
            dutyStatus: string;
            currentLat: number | null;
            currentLng: number | null;
            currentSpeed: number | null;
            currentHeading: number | null;
            lastGpsUpdate: Date | null;
            batteryLevel: number | null;
            driverId: string | null;
            routeId: string | null;
        };
        validations: {
            hasAssignedBus: boolean;
            hasAssignedRoute: boolean;
            isBusActive: boolean;
            isTripCompletedToday: boolean;
            canStartTrip: boolean;
            validationError: string;
        };
    }>;
    updateDriverDuty(userId: string, tenantId: string, dutyStatus: string): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        busNumber: string;
        registrationNo: string;
        vehicleModel: string | null;
        capacity: number;
        busPhotoUrl: string | null;
        pickupTime: string | null;
        dropTime: string | null;
        dutyStatus: string;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        currentHeading: number | null;
        lastGpsUpdate: Date | null;
        batteryLevel: number | null;
        driverId: string | null;
        routeId: string | null;
    }>;
    processDriverGps(userId: string, tenantId: string, gpsData: {
        lat: number;
        lng: number;
        speed?: number;
        heading?: number;
        accuracy?: number;
        batteryLevel?: number;
        dutyStatus?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        busNumber: string;
        registrationNo: string;
        vehicleModel: string | null;
        capacity: number;
        busPhotoUrl: string | null;
        pickupTime: string | null;
        dropTime: string | null;
        dutyStatus: string;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        currentHeading: number | null;
        lastGpsUpdate: Date | null;
        batteryLevel: number | null;
        driverId: string | null;
        routeId: string | null;
    }>;
    private notifyParentsForBus;
    getParentStudentTransport(studentId: string, parentUserId: string, tenantId: string): Promise<{
        hasBusAssigned: boolean;
        message: string;
        studentName?: undefined;
        bus?: undefined;
        driver?: undefined;
        route?: undefined;
        assignedStop?: undefined;
        telemetry?: undefined;
    } | {
        hasBusAssigned: boolean;
        studentName: string;
        bus: {
            id: string;
            busNumber: string;
            registrationNo: string;
            vehicleModel: string;
            capacity: number;
            pickupTime: string;
            dropTime: string;
            dutyStatus: string;
            isOnline: boolean;
            currentLat: number;
            currentLng: number;
            currentSpeed: number;
            currentHeading: number;
            lastGpsUpdate: Date;
        };
        driver: {
            name: string;
            phone: string;
            licenseNumber: string;
            avatarUrl: string;
        };
        route: {
            id: string;
            routeName: string;
            stops: {
                id: string;
                updatedAt: Date;
                createdAt: Date;
                pickupTime: string | null;
                dropTime: string | null;
                routeId: string;
                sequenceOrder: number;
                stopName: string;
                lat: number;
                lng: number;
            }[];
        };
        assignedStop: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            pickupTime: string | null;
            dropTime: string | null;
            routeId: string;
            sequenceOrder: number;
            stopName: string;
            lat: number;
            lng: number;
        };
        telemetry: {
            etaMinutes: number;
            distanceKm: number;
            currentStop: string;
            nextStop: string;
        };
        message?: undefined;
    }>;
    getTripHistory(tenantId: string): Promise<({
        bus: {
            busNumber: string;
            registrationNo: string;
        };
        route: {
            routeName: string;
        };
        driver: {
            user: {
                name: string;
            };
        } & {
            id: string;
            tenantId: string;
            status: string | null;
            address: string | null;
            userId: string;
            employeeId: string | null;
            designation: string | null;
            basicSalary: import("@prisma/client/runtime/library").Decimal | null;
            allowances: import("@prisma/client/runtime/library").Decimal | null;
            deductions: import("@prisma/client/runtime/library").Decimal | null;
            pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
            joiningDate: Date | null;
            qualification: string | null;
            subjectsTaught: string[];
            staffCategory: string | null;
            staffRole: string | null;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            experienceYears: number | null;
            bloodGroup: string | null;
            aadhaarNo: string | null;
            whatsappNumber: string | null;
            emergencyContact: string | null;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        busId: string;
        startTime: Date;
        endTime: Date | null;
        driverId: string | null;
        routeId: string | null;
        tripType: string;
        totalDistanceKm: number;
        avgSpeedKmh: number;
        maxSpeedKmh: number;
        arrivalTimestamp: Date | null;
    })[]>;
    private detectAndMarkOfflineBuses;
}
