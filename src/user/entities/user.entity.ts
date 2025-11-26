// user.entity.ts
import { Role } from 'src/enum/role.enum';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';

@Entity({ name: 'users', schema: 'public' })
@TableInheritance({
  column: {
    type: 'varchar',
    name: 'user_type',
  },
})
export abstract class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  passwordUrl: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  profileImgUrl: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CLIENT,
  })
  role: Role;

  @Column({ type: 'int', default: 0 })
  rating: number;

  @Column({ default: true })
  isActive: boolean;
}
