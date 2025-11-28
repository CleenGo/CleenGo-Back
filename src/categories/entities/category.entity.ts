import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Services } from "./services.entity";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        type: 'varchar',
        length: 50
    })
    name: string

    @OneToMany(() => Services, (service) => service.category)
    @JoinColumn({name: 'services_id'})
    services: Services[]

    @Column({type: 'boolean', default: true})
    isActive: boolean
}
