export declare enum BehaviorTypeEnum {
    COMPLAINT = "Complaint",
    PRAISE = "Praise"
}
export declare class CreateBehaviorDto {
    studentId: string;
    behaviorType: BehaviorTypeEnum;
    category: string;
    description: string;
    academicYear: string;
    teacherId: string;
}
