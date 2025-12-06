import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth';
import { SUPABASE_CLIENT } from './supabase/supabase.module';
import { SupabaseClient } from '@supabase/supabase-js';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/enum/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterProviderDto } from 'src/provider/dto/create-provider.dto';
import { Provider } from 'src/provider/entities/provider.entity';
import { JwtService } from '@nestjs/jwt';
import { ThirdPartyAuthDto } from './dto/third-party-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabaseClient: SupabaseClient,

    @InjectRepository(User) private readonly userRepository: Repository<User>,

    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,

    private readonly jwtService: JwtService,
  ) {}

  //? -------- Registro de cliente --------
  async clientSignUp(registerUserDto: RegisterUserDto) {
    const { name, surname, email, password, birthDate, profileImgUrl, phone } =
      registerUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser)
      throw new BadRequestException(
        '⚠️ Ya existe un usuario registrado con ese email',
      );

    const { data, error } = await this.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'client',
          name,
          surname,
          phone,
        },
      },
    });

    if (error) {
      // console.log('🔥 SUPABASE ERROR:', error);
      throw new BadRequestException(`⚠️ Supabase: ${error.message}`);
    }

    if (!data.user) {
      // console.log('🔥 SUPABASE DATA WITHOUT USER:', data);
      throw new BadRequestException('⚠️ Supabase no devolvió un usuario');
    }

    const supabaseUser = data.user;

    const formattedName = this.capitalize(name);
    const formattedSurname = this.capitalize(surname);

    const birthDateValue =
      birthDate instanceof Date ? birthDate : new Date(birthDate);

    console.log('Role.CLIENT =>', Role.CLIENT);

    const newUser = this.userRepository.create({
      name: formattedName,
      surname: formattedSurname,
      email,
      passwordUrl: supabaseUser.id,
      birthDate: birthDateValue,
      profileImgUrl,
      phone,
      role: Role.CLIENT,
    });

    const savedUser = await this.userRepository.save(newUser);

    const { passwordUrl, ...safeUser } = savedUser;

    return {
      message: '✅ Usuario cliente registrado exitosamente',
      user: safeUser,
      // supabaseUser, // sólo para debug
    };
  }

  //? -------- Capitalize helper --------
  private capitalize(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  //? -------- Registro de proveedor --------
  async providerSignUp(registerProviderDto: RegisterProviderDto) {
    const {
      name,
      surname,
      email,
      password,
      birthDate,
      profileImgUrl,
      phone,
      days,
      hours,
      about,
    } = registerProviderDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser)
      throw new BadRequestException(
        '⚠️ Ya existe un usuario registrado con ese email',
      );

    const { data, error } = await this.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'provider',
          name,
          surname,
          phone,
        },
      },
    });

    if (error) {
      // console.log('🔥 SUPABASE ERROR:', error);
      throw new BadRequestException(`⚠️ Supabase: ${error.message}`);
    }

    if (!data.user) {
      // console.log('🔥 SUPABASE DATA WITHOUT USER:', data);
      throw new BadRequestException('⚠️ Supabase no devolvió un usuario');
    }

    const supabaseProvider = data.user;

    const formattedName = this.capitalize(name);
    const formattedSurname = this.capitalize(surname);

    const birthDateValue =
      birthDate instanceof Date ? birthDate : new Date(birthDate);

    const newProvider = this.providerRepository.create({
      name: formattedName,
      surname: formattedSurname,
      email,
      passwordUrl: supabaseProvider.id,
      birthDate: birthDateValue,
      profileImgUrl,
      phone,
      days,
      hours,
      about,
      role: Role.PROVIDER,
    });

    const savedProvider = await this.providerRepository.save(newProvider);

    const { passwordUrl, ...safeProvider } = savedProvider;

    return {
      message: '✅ Usuario proveedor registrado exitosamente',
      provider: safeProvider,
      // supabaseProvider, // sólo para debug
    };
  }

  //? -------- Inicio de sesión --------
  async logIn(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new BadRequestException(` ⚠️Credenciales inválidas`);

    console.log('🔥 SUPABASE access_token:', data.session?.access_token); //para prueba de OAuth

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user)
      throw new BadRequestException(
        '⚠️ Usuario autenticado en supabase no existe en la base de datos',
      );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const { passwordUrl, ...safeUser } = user;

    return {
      message: '✅ Inicio de sesión exitoso',
      accessToken,
      user: safeUser,
    };
  }

  //? -------- OAuth --------
  async thirdPartyAuth(roleParam: string, dto: ThirdPartyAuthDto) {
    const { accessToken, name, surname, phone, profileImgUrl } = dto;

    // 1. Validar token de Supabase
    const { data, error } = await this.supabaseClient.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new BadRequestException('⚠️ Token inválido o expirado');
    }

    const supabaseUser = data.user;
    const email = supabaseUser.email;

    if (!email) {
      throw new BadRequestException('⚠️ El usuario no tiene un email válido');
    }

    // 2. Normalizar rol para que coincida con el enum
    let role: Role;
    if (roleParam === 'client') role = Role.CLIENT;
    else if (roleParam === 'provider') role = Role.PROVIDER;
    else throw new BadRequestException('⚠️ Rol inválido');

    // 3. Buscar usuario en la DB por email
    let user = await this.userRepository.findOne({ where: { email } });

    // 4. Formatear campos
    const formattedName =
      name ?? this.capitalize(supabaseUser.user_metadata?.name || 'Usuario');

    const formattedSurname =
      surname ?? this.capitalize(supabaseUser.user_metadata?.surname ?? '');

    const finalImg =
      profileImgUrl ?? supabaseUser.user_metadata?.avatar_url ?? null;

    const finalPhone = phone ?? supabaseUser.user_metadata?.phone ?? null;

    // 5. Si el usuario YA existe → solo login
    if (user) {
      if (user.role !== role) {
        throw new BadRequestException(
          `⚠️ Esta cuenta está registrada como "${user.role}". No puede iniciar sesión como "${role}".`,
        );
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const jwtAccessToken = this.jwtService.sign(payload);
      const { passwordUrl, ...safeUser } = user;

      return {
        message: '✅ Inicio de sesión por terceros exitoso',
        accessToken: jwtAccessToken,
        user: safeUser,
      };
    }

    // 6. Si NO existe → crear nuevo usuario
    const newUser = this.userRepository.create({
      name: formattedName,
      surname: formattedSurname,
      email,
      passwordUrl: supabaseUser.id,
      birthDate: new Date(),
      profileImgUrl: finalImg,
      phone: finalPhone,
      role,
    });

    try {
      user = await this.userRepository.save(newUser);
    } catch (err: any) {
      // Si falla por email duplicado (error 23505) → recuperamos el user y hacemos login
      if (err.code === '23505') {
        user = await this.userRepository.findOne({ where: { email } });
        if (!user) throw err;

        const payload = {
          sub: user.id,
          email: user.email,
          role: user.role,
        };

        const jwtAccessToken = this.jwtService.sign(payload);
        const { passwordUrl, ...safeUser } = user;

        return {
          message: '✅ Inicio de sesión por terceros exitoso',
          accessToken: jwtAccessToken,
          user: safeUser,
        };
      }

      // Otro error de DB → lo propagamos
      throw err;
    }

    // 7. JWT para usuarios nuevos
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtAccessToken = this.jwtService.sign(payload);
    const { passwordUrl, ...safeUser } = user;

    return {
      message: '✅ Registro por terceros exitoso',
      accessToken: jwtAccessToken,
      user: safeUser,
    };
  }

  //? -------- Cambio de contraseña --------
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new BadRequestException('⚠️ Usuario no encontrado');

    const { error: signInError } =
      await this.supabaseClient.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

    if (signInError)
      throw new BadRequestException('⚠️ La contraseña actual es incorrecta');

    const { error: updateError } =
      await this.supabaseClient.auth.admin.updateUserById(user.passwordUrl, {
        password: newPassword,
      });

    if (updateError)
      throw new BadRequestException(
        `⚠️ No se pudo actualizar la contraseña. Inténtalo más tarde.`,
      );

    return {
      message: '✅ Contraseña actualizada correctamente',
    };
  }
}
