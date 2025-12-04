import { IsOptional, IsString } from 'class-validator';

export class FilterProviderDto {
    @IsOptional()
    @IsString()
    day?: string;

    @IsOptional()
    @IsString()
    hour?: string;
}