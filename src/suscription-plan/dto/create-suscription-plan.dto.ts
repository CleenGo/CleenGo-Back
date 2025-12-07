import { ApiHideProperty, ApiProperty } from "@nestjs/swagger"
import { IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { Suscription } from "src/suscription/entities/suscription.entity"

export class CreatePlanDto {
    @ApiHideProperty()
    @IsEmpty({
        message: 'El id del plan debe estar vacio, se generara automaticamente'
    })
    id: string

    @ApiProperty({
        description: 'Nombre del plan',
        example: 'Plan Basico',
    })
    @IsNotEmpty()
    @IsString()
    name: string

    @ApiProperty({
        description: 'Precio del plan',
        example: 9.99,
    })
    @IsNotEmpty()
    @IsNumber()
    price: number

    @ApiProperty({
        description: 'Descripción del plan',
        example: 'plan gratuito con acceso limitado a la app y funcionalidades básicas',
    })
    description: string

    @ApiHideProperty()
    @IsEmpty()
    suscriptions: Suscription[]

    @ApiHideProperty()
    @IsEmpty()
    isActive: boolean
}
