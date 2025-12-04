import { Inject, Injectable } from '@nestjs/common';
import { SUPABASE_CLIENT } from 'src/auth/supabase/supabase.module';
import { SupabaseClient } from '@supabase/supabase-js';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/enum/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { SUPABASE_STORAGE_CLIENT } from 'src/auth/supabase/supabase-storage.module';

@Injectable()
export class FileUploadService {
  constructor(
    @Inject(SUPABASE_STORAGE_CLIENT)
    private readonly supabaseStorage: SupabaseClient,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async uploadUserAvatar(userId: string, file: any, currentUser: any) {
    console.log('➡️ uploadUserAvatar()');
    console.log('userId:', userId);
    console.log('currentUser:', {
      id: currentUser?.id,
      role: currentUser?.role,
    });
    console.log('file:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
    });

    if (!file) throw new Error(`No se recibió ninguna imagen`);

    const isAdmin = currentUser?.role === Role.ADMIN;
    const isSelf = currentUser?.id === userId;

    if (!isAdmin && !isSelf)
      throw new Error(
        `No tienes permiso para actualizar esta imagen de perfil`,
      );

    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedMimes.includes(file.mimetype))
      throw new Error(
        `Tipo de archivo no permitido. Formatos permitidos: ${allowedMimes.join(', ')}`,
      );

    const fileExtension = file.originalname.split('.').pop();
    const timestamp = Date.now();
    const filePath = `${userId}/avatar-${timestamp}.${fileExtension}`;

    const bucket = process.env.SUPABASE_AVATARS_BUCKET || 'avatars';
    console.log('Bucket usado:', bucket);
    console.log('filePath:', filePath);

    try {
      const { error: uploadError } = await this.supabaseStorage.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error('🔥 Supabase upload error:', uploadError);
        throw new Error(
          `Error al subir la imagen a Supabase: ${uploadError.message}`,
        );
      }
    } catch (err) {
      console.error('🔥 Error en uploadUserAvatar:', err);
      throw err; // deja que Nest lo convierta en 500
    }

    const { data: publicUrlData } = this.supabaseStorage.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new Error(`Usuario no encontrado`);

    user.profileImgUrl = avatarUrl;

    await this.userRepository.save(user);

    return {
      message: 'Imagen de perfil actualizada correctamente',
      userId: user.id,
      avatarUrl,
    };
  }
}
