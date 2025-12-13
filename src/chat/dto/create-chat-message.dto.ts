import { IsUUID, IsString, MinLength } from 'class-validator';

export class CreateChatMessageDto {
  @IsUUID()
  appointmentId: string;

  @IsString()
  @MinLength(1)
  content: string;
}
