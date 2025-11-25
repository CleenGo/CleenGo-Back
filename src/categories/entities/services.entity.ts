import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";

@Entity('services')
export class Services {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    unitaryPrice: number

    @ManyToOne(() => Category, (category) => category.services)
    @JoinColumn({ name: 'categoryId' })
    category: Category

    @Column()
    isActive: boolean
}