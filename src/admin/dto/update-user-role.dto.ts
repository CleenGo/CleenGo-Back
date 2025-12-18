import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsIn(['admin', 'client', 'provider'])
  role: 'admin' | 'client' | 'provider';
}
