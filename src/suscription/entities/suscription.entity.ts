//CleenGo-Back/src/suscription/entities/suscription.entity.ts
import { Provider } from 'src/provider/entities/provider.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Plan } from 'src/suscription-plan/entities/suscription-plan.entity';

@Entity('suscription')
export class Suscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @OneToOne(() => Provider, (provider) => provider.suscription)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'boolean', default: false })
  paymentStatus: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
