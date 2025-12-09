
import { IsUUID, IsDateString, IsOptional } from 'class-validator';
import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateSuscriptionDto {
    @IsUUID()
    planId: string;

    @IsUUID()
    providerId: string;

    @IsDateString()
    startDate: string;
}
