import { Role } from 'src/enum/role.enum';

export interface ClientFilter {
  name?: string;
  email?: string;
  isActive?: boolean;
}
