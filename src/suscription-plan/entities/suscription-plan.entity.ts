import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Suscription } from "src/suscription/entities/suscription.entity";

@Entity('plans')

export class Plan {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type: 'varchar', length: 50, nullable: false,})
    name: string

    @Column({type: 'decimal', precision: 10, scale: 2, nullable: false,})
    price: number

    @Column({type: 'text' , nullable: false,})
    description: string

    @OneToMany(() => Suscription, (suscription) => suscription.plan)
    suscriptions: Suscription[]

    @Column({type: 'boolean', default: true})
    isActive: boolean
}
