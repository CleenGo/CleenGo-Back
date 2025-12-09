import { PartialType } from '@nestjs/swagger';
import { CreateSuscriptionDto } from './create-suscription.dto';
import { PrimaryColumn, Column } from 'typeorm';
import { IsEmpty, IsOptional, IsString, IsBoolean, IsDateString, IsUUID } from 'class-validator';

export class UpdateSuscriptionDto extends PartialType(CreateSuscriptionDto) {
    @IsOptional()
    @IsUUID()
    planId?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsBoolean()
    paymentStatus?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
