import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { UpdateFileUploadDto } from './dto/update-file-upload.dto';
import { FileUpload } from './entities/file-upload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileUpload])],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
