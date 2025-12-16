import { IsUUID, IsString, Matches } from 'class-validator';

export class CreateChatMessageDto {
  @IsUUID()
  appointmentId: string;

  @IsString()
  @Matches(/\S/, { message: 'content no puede estar vacío' })
  content: string;
}
