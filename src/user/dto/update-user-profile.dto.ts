// src/user/dto/update-user-profile.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'Tester100' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Example' })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'Fecha de nacimiento en formato YYYY-MM-DD',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsUrl()
  profileImgUrl?: string;

  @ApiPropertyOptional({
    example: '+521234567890',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone?: string;
}
