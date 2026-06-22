// src/complaint-box/dto/create-behavior.dto.ts
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum BehaviorTypeEnum {
  COMPLAINT = 'Complaint',
  PRAISE = 'Praise',
}

export class CreateBehaviorDto {
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsNotEmpty()
  @IsEnum(BehaviorTypeEnum)
  behaviorType: BehaviorTypeEnum;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  academicYear: string;

  @IsOptional()
  @IsString()
  teacherId?: string;
}
