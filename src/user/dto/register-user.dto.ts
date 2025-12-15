import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { IsAdultDate } from 'src/decorators/is-adult-date.validator';
import { MatchPassword } from 'src/decorators/match-password.decorator';
import { Role } from 'src/enum/role.enum';

export class RegisterUserDto {
  @ApiHideProperty()
  id: string;

  @ApiProperty({
    example: 'Tester1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Example',
  })
  @IsNotEmpty()
  @IsString()
  surname: string;

  @ApiProperty({
    example: 'tester1@test.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Hola1234!',
  })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'Hola1234!',
  })
  @IsNotEmpty()
  @IsStrongPassword()
  @Validate(MatchPassword, ['password'])
  confirmPassword: string;

  @ApiProperty({
    example: '1990-01-01',
    description:
      'Fecha de nacimiento en formato YYYY-MM-DD (usuarios ≥18 años)',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsAdultDate()
  birthDate: Date;

  @ApiHideProperty()
  // @IsEnum(Role)
  role: string;

  @ApiHideProperty()
  rating: number;

  @ApiHideProperty()
  isActive: boolean;
}
