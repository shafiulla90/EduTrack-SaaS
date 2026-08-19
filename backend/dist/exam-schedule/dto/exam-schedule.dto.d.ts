export declare class CreateExamScheduleDto {
    examName: string;
    academicYearId: string;
    classSectionId: string;
    subjectId: string;
    examDate: string;
    startTime: string;
    endTime: string;
    examHall?: string;
    instructions?: string;
    status?: string;
}
export declare class UpdateExamScheduleDto {
    examName?: string;
    academicYearId?: string;
    classSectionId?: string;
    subjectId?: string;
    examDate?: string;
    startTime?: string;
    endTime?: string;
    examHall?: string;
    instructions?: string;
    status?: string;
}
export declare class BulkCreateDto {
    schedules: CreateExamScheduleDto[];
}
export declare class BulkStatusDto {
    ids: string[];
    status: string;
}
export declare class BulkDeleteDto {
    ids: string[];
}
