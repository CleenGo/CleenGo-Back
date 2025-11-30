import { Provider } from "src/provider/entities/provider.entity";
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('suscription')
export class Suscription {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type: 'varchar', length: 50, nullable: false,})
    name: string

    @Column({type: 'decimal', precision: 10, scale: 2, nullable: false,})
    price: number

    @OneToMany(()=> Provider, (provider) => provider.suscription)
    @JoinColumn({name: 'providers_id'})
    providers: Provider[]
    
    @Column({type: 'boolean', default: true})
    isActive: boolean
}
