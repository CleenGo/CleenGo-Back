import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('avatar/:userId')
  @ApiOperation({
    summary:
      'Subir o actualizar la imagen de perfil (avatar) de un usuario (cliente, proveedor o admin)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de perfil (JPEG, PNG, etc.)',
        },
      },
      required: ['file'],
    },
  })
  @Roles(Role.CLIENT, Role.PROVIDER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserAvatar(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    const currentUser = req.user;

    return this.fileUploadService.uploadUserAvatar(userId, file, currentUser);
  }
}
