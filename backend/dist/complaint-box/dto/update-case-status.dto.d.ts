export declare enum ComplaintStatusEnum {
    NEW = "New",
    IN_PROGRESS = "In Progress",
    CLOSED = "Closed"
}
export declare class UpdateCaseStatusDto {
    status: ComplaintStatusEnum;
}
