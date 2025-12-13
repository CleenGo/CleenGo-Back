import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'ID del proveedor que realiza el pago' })
  @IsString()
  @IsNotEmpty({ message: 'providerId is required' })
  providerId: string;
}