// src/provider/entities/provider.entity.ts
import { ChildEntity, Column, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Services } from 'src/categories/entities/services.entity';
import { Suscription } from 'src/suscription/entities/suscription.entity';


@ChildEntity()
export class Provider extends User {
  @Column('text', { array: true, nullable: true })
  days: string[];

  @Column('text', { array: true, nullable: true })
  hours: string[];

  @Column({ type: 'text', nullable: true })
  about: string;

  @ManyToMany(() => Services)
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
  services: Services[];

  @ManyToOne(()=> Suscription, (suscription) => suscription.providers)
  @JoinColumn({name: 'suscription_id'})
  suscription: Suscription
}
