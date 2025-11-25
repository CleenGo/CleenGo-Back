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

    @Column()
    rating: number

    @Column()
    comment: string

    @Column()
    imgUrl: string

    @Column()
    date: Date

    @Column()
    isActive: boolean
}
