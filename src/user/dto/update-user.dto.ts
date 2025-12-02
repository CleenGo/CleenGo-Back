// src/user/dto/update-user.dto.ts
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { RegisterUserDto } from './register-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @ApiPropertyOptional({
    example: 'MiContraseñaActual123!',
    description:
      'Contraseña actual del usuario. Obligatoria solo si se desea cambiar la contraseña.',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;
}
