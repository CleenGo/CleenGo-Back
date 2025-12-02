// src/provider/entities/provider.entity.ts
import {
  ChildEntity,
  Column,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Service } from 'src/categories/entities/services.entity';
import { Suscription } from 'src/suscription/entities/suscription.entity';

@ChildEntity()
export class Provider extends User {
  @Column('text', { array: true, nullable: true })
  days: string[];

  @Column('text', { array: true, nullable: true })
  hours: string[];

  @Column({ type: 'text', nullable: true })
  about: string;

  @ManyToMany(() => Service) // 👈 quitamos (service) => service.providers
  @JoinTable({
    name: 'provider_services',
    joinColumn: {
      name: 'providerId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'serviceId',
      referencedColumnName: 'id',
    },
  })
  services: Service[];

  @OneToOne(() => Suscription, (Suscription) => Suscription.provider)
  @JoinColumn({ name: 'suscription_id' })
  suscription: Suscription;
}
