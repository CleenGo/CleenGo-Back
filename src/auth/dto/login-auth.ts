import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Min, MinLength, Validate } from 'class-validator';
import { MatchPassword } from 'src/decorators/match-password.decorator';

export class LoginAuthDto {
  @ApiProperty({ example: 'tester1@test.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Hola1234!' })
  @IsNotEmpty()
  @MinLength(5)
  password: string;
}
