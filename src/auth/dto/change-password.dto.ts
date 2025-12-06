import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Validate,
} from 'class-validator';
import { MatchPassword } from 'src/decorators/match-password.decorator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'MiPasswordActual123*',
    description: 'Contraseña actual del usuario',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'MiNuevaPassword123*',
    description: 'Nueva contraseña que desea establecer el usuario',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  newPassword: string;

  @ApiProperty({
    example: 'MiNuevaPassword123*',
    description: 'Confirmación de la nueva contraseña',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  @Validate(MatchPassword, ['newPassword'])
  confirmPassword: string;
}
