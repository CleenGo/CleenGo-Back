import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";
import { Provider } from "src/provider/entities/provider.entity";

@Entity('service')
export class Service {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type: 'varchar', length: 50, nullable: false,})
    name: string

    @Column({type: 'decimal', precision: 10, scale: 2, nullable: false,})
    unitaryPrice: number

    @ManyToOne(() => Category, (category) => category.services)
    @JoinColumn({ name: 'categoryId' })
    category: Category

    @ManyToMany(()=> Provider, (provider) => provider.services)
    @JoinTable({
      name: 'PROVIDER_SERVICES',
      joinColumn: {
        name: 'serviceId',
        referencedColumnName: 'id',
      },
      inverseJoinColumn: {
        name: 'providerId',
        referencedColumnName: 'id',
      },
    })
    providers: Provider[]

    @Column({type: 'boolean', default: true})
    isActive: boolean
}