import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Service } from "./services.entity";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        type: 'varchar',
        length: 50
    })
    name: string

    @OneToMany(() => Service, (service) => service.category)
    @JoinColumn({name: 'services_id'})
    services: Service[]

    @Column({type: 'boolean', default: true})
    isActive: boolean
}
