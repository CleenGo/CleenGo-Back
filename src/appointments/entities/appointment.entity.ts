import { Services } from "src/categories/entities/services.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AppointmentStatus } from "../../enum/appointmenStatus.enum";
@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string
    
    @ManyToOne(()=> User)
    @JoinColumn({name: 'client_id'})
    clientId: User

    @ManyToOne(()=> User)
    @JoinColumn({name: 'provider_id'})
    providerId: User

    @ManyToMany(()=>Services)
    @JoinTable({
    name: 'APPOINTMENT_SERVICES',
    joinColumn: {
      name: 'serviceId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'appointmentId',
      referencedColumnName: 'id',
    },
  })
    services: Services[]

    @Column()
    price: number

    @Column()
    addressUrl: string

    @Column()
    date: Date

    @Column()
    startHour: string

    @Column()
    endHour: string

    @Column({type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING
    })
    status: AppointmentStatus

    @Column()
    isActive: boolean
}
