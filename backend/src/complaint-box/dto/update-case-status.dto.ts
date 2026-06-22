// src/complaint-box/dto/update-case-status.dto.ts
import { IsNotEmpty, IsEnum } from 'class-validator';

export enum ComplaintStatusEnum {
  NEW = 'New',
  CLOSED = 'Closed',
}

export class UpdateCaseStatusDto {
  @IsNotEmpty()
  @IsEnum(ComplaintStatusEnum)
  status: ComplaintStatusEnum;
}
