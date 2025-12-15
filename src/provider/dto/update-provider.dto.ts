import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { RegisterProviderDto } from './create-provider.dto';
import { IsOptional, IsString, IsDateString, IsUrl, MinLength, MaxLength, IsNumber } from 'class-validator';

export class UpdateProviderDto {
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
        example: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      })
      @IsOptional()
      days?: string[];

      @ApiPropertyOptional({
        example: ['06:00-09:00', '09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00', '21:00-00:00'],
      })
      @IsOptional()
      hours?: string[];

      @ApiPropertyOptional({
        example:['Puesta en valor / jardinería intensiva','Mantenimiento integral de jardín']
      })
      @IsOptional()
      services?: string[];

      
      @ApiPropertyOptional({ example: 'Descripción del proveedor' })
      @IsOptional()
      @IsString()
      about?: string;


      @ApiPropertyOptional({
        example: '+521234567890',
      })
      @IsOptional()
      @IsString()
      @MinLength(10)
      @MaxLength(15)
      phone?: string;
    
      @ApiPropertyOptional({ example: 'Av. Insurgentes Sur' })
      @IsOptional()
      @IsString()
      street?: string;
    
      @ApiPropertyOptional({ example: '123' })
      @IsOptional()
      @IsString()
      exteriorNumber?: string;
    
      @ApiPropertyOptional({ example: 'Depto. 5B' })
      @IsOptional()
      @IsString()
      interiorNumber?: string;
    
      @ApiPropertyOptional({ example: 'Roma Norte' })
      @IsOptional()
      @IsString()
      neighborhood?: string;
    
      @ApiPropertyOptional({ example: 'Ciudad de México' })
      @IsOptional()
      @IsString()
      city?: string;
    
      @ApiPropertyOptional({ example: 'CDMX' })
      @IsOptional()
      @IsString()
      state?: string;
    
      @ApiPropertyOptional({ example: '06700' })
      @IsOptional()
      @IsString()
      @MaxLength(10)
      postalCode?: string;
    
      @ApiPropertyOptional({
        example: 'Av. Insurgentes Sur 123, Roma Norte, CDMX',
        description: 'Dirección completa generada automáticamente',
      })
      @IsOptional()
      @IsString()
      fullAddress?: string;
    
      @ApiPropertyOptional({
        example: 19.404,
        description: 'Latitud tomada desde mapa o GPS',
      })
      @IsOptional()
      @IsNumber()
      latitude?: number;
    
      @ApiPropertyOptional({
        example: -99.169,
        description: 'Longitud tomada desde mapa o GPS',
      })
      @IsOptional()
      @IsNumber()
      longitude?: number;
}
