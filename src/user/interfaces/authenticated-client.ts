import { Role } from 'src/enum/role.enum';

export interface AuthenticatedClient {
  id: string;
  email: string;
  role: Role;
}
