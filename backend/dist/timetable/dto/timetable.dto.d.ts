export declare class CreateClassDto {
    name: string;
    academicYearId?: string;
}
export declare class CreateSectionDto {
    name: string;
}
export declare class CreateSubjectDto {
    name: string;
    code?: string;
    description?: string;
}
export declare class BulkSubjectDto {
    name: string;
}
export declare class BulkSubjectsInputDto {
    subjects: BulkSubjectDto[];
}
export declare class CreateTeacherSkillDto {
    subjectId: string;
    skillLevel: string;
    yearsOfExperience?: number;
}
export declare class CreateTeacherWithSkillsDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    qualification?: string;
    designation?: string;
    basicSalary?: number;
    allowances?: number;
    deductions?: number;
    pfDeduction?: number;
    joiningDate?: string;
    staffStatus?: string;
    employeeId?: string;
    skills: CreateTeacherSkillDto[];
}
export declare class BulkTeacherDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    qualification?: string;
    designation?: string;
    basicSalary?: number;
    allowances?: number;
    deductions?: number;
    pf?: number;
    joiningDate?: string;
    subject1?: string;
    skillLevel1?: string;
    subject2?: string;
    skillLevel2?: string;
    subject3?: string;
    skillLevel3?: string;
    skills?: CreateTeacherSkillDto[];
}
export declare class BulkTeachersInputDto {
    teachers: BulkTeacherDto[];
}
export declare class CreateClassSectionDto {
    academicYearId: string;
    classId: string;
    sectionId: string;
    classStrength?: number;
    subjectTeacherMap: Record<string, string[]>;
    subjectPeriodsMap?: Record<string, number[]>;
}
export declare class UpdateTeacherAssignmentDto {
    newTeacherId?: string;
    periodsPerWeek?: number;
}
export declare class SaveSubstituteDto {
    periodId: string;
    substituteTeacherId?: string;
}
export declare class SaveTimetablePeriodCellDto {
    day: string;
    periodNumber: number;
    subjectId?: string;
    teacherId?: string;
    startTime?: string;
    endTime?: string;
}
export declare class SaveTimetablePeriodsDto {
    classSectionId: string;
    academicYearId: string;
    periods: SaveTimetablePeriodCellDto[];
}
export declare class PeriodTimingDto {
    id?: string;
    periodNumber: number;
    name: string;
    isBreak?: boolean;
    startTime: string;
    endTime: string;
}
export declare class SaveTimetableConfigDto {
    workingDays: string[];
    schoolStartTime: string;
    schoolEndTime: string;
    periodDuration: number;
    autoGenerate: boolean;
    numPeriods: number;
    periods: PeriodTimingDto[];
}
