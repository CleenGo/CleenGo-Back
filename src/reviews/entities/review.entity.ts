import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id:string

    @ManyToOne(()=>User)
    @JoinColumn({name: 'reviewer_id'})
    userReviewer: User

    @ManyToOne(()=>User)
    @JoinColumn({name: 'rated_id'})
    ratedUser: User

    @Column({type: 'int', default: 0})
    rating: number

    @Column({type: 'text', nullable: true})
    comment: string

    @Column({type: 'text', nullable: true})
    imgUrl: string

    @Column({type: 'date', nullable: false})
    date: Date

    @Column({type: 'boolean', default: true})
    isActive: boolean
}
