export declare enum AttendanceStatus {
    PRESENT = "PRESENT",
    ABSENT = "ABSENT",
    LATE = "LATE",
    HALF_DAY = "HALF_DAY"
}
export declare class CreateAttendanceDto {
    studentId: string;
    date: string;
    status: AttendanceStatus;
}
