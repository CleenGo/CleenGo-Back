import { IsBoolean } from 'class-validator';

export class ToggleUserActiveDto {
  @IsBoolean()
  isActive: boolean;
}
