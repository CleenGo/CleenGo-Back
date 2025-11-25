import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Services } from "./services.entity";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @OneToMany(() => Services, (service) => service.category)
    @JoinColumn({name: 'services_id'})
    services: Services[]

    @Column()
    isActive: boolean
}
