import { PartialType } from '@nestjs/swagger';
import { RegisterProviderDto } from './create-provider.dto';

export class UpdateProviderDto extends PartialType(RegisterProviderDto) {}
