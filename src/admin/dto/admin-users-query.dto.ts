import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  // role: "client" | "provider" | "admin"
  @IsOptional()
  @IsIn(['client', 'provider', 'admin'])
  role?: 'client' | 'provider' | 'admin';

  // status: "active" | "inactive"
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  // búsqueda por name/email
  @IsOptional()
  @IsString()
  search?: string;
}
