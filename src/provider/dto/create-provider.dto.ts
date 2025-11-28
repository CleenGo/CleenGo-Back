import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';

export class RegisterProviderDto extends RegisterUserDto {
  @ApiProperty({
    example: ['Monday', 'Tuesday', 'Wednesday'],
    description: 'Días de disponibilidad del proveedor',
  })
  @IsNotEmpty({ each: true }) // Validar que cada elemento no esté vacío
  @IsString({ each: true }) // Validar que cada elemento sea una cadena
  days: string[];

  @ApiProperty({
    example: ['09:00-12:00', '14:00-18:00'],
    description: 'Horas de disponibilidad del proveedor',
  })
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  hours: string[];

  @ApiProperty({
    example:
      'Cuento con más de 10 años de experiencia en limpieza residencial y comercial.',
    description: 'Descripción sobre el proveedor',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @MaxLength(250)
  about: string;
}
