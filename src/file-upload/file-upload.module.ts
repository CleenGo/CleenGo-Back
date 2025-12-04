import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { FileUpload } from './entities/file-upload.entity';
import { SupabaseStorageModule } from 'src/auth/supabase/supabase-storage.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileUpload, User]),
    SupabaseStorageModule,
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
