import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
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

// 🔹 NUEVO: Nodemailer + Config + DTOs de recovery
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  // 🔹 NUEVO: logger para mensajes de nodemailer / recovery
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabaseClient: SupabaseClient,

    @InjectRepository(User) private readonly userRepository: Repository<User>,

    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,

    private readonly jwtService: JwtService,

    // 🔹 NUEVO: inyectar servicio de Nodemailer
    private readonly nodemailerService: NodemailerService,

    // 🔹 NUEVO: para FRONTEND_URL
    private readonly configService: ConfigService,
  ) {}

  //? -------- Registro de cliente --------
  async clientSignUp(registerUserDto: RegisterUserDto) {
    const { name, surname, email, password, birthDate } = registerUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser)
      throw new BadRequestException(
        '⚠️ Ya existe un usuario registrado con ese email',
      );

    const emailExtension = email.split('@')[1];

    let role;

    if (emailExtension === 'cleengo.com') {
      role = Role.ADMIN;
    } else {
      role = Role.CLIENT;
    }

    const { data, error } = await this.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name,
          surname,
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

    console.log('Role =>', role);

    const newUser = this.userRepository.create({
      name: formattedName,
      surname: formattedSurname,
      email,
      passwordUrl: supabaseUser.id,
      birthDate: birthDateValue,

      role: role,
    });

    const savedUser = await this.userRepository.save(newUser);

    const { passwordUrl, ...safeUser } = savedUser;

    // 🔹 NUEVO: enviar correo de bienvenida
    this.sendWelcomeEmail(safeUser.email, safeUser.name, safeUser.role);

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
    const { name, surname, email, password, birthDate } = registerProviderDto;

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

      role: Role.PROVIDER,
    });

    const savedProvider = await this.providerRepository.save(newProvider);

    const { passwordUrl, ...safeProvider } = savedProvider;

    // 🔹 NUEVO: correo de bienvenida para proveedor
    this.sendWelcomeEmail(
      safeProvider.email,
      safeProvider.name,
      safeProvider.role,
    );

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

  //? -------- Nodemailer Helper (bienvenida) --------
  private async sendWelcomeEmail(to: string, name: string, role: Role) {
    const roleLabel =
      role === Role.CLIENT
        ? 'cliente'
        : role === Role.PROVIDER
          ? 'proveedor'
          : 'admin';

    const subject = '¡Bienvenido a CleenGo! 🎉';

    const html = `
      <h1>¡Hola, ${name}!</h1>
      <p>
        Gracias por registrarte como <strong>${roleLabel}</strong> en
        <strong>CleenGo</strong>.
      </p>
      <p>
        Desde ahora podrás gestionar tus servicios de limpieza y mantener tus
        espacios siempre impecables.
      </p>
      <hr />
      <p style="font-size: 12px; color: #888;">
        Este correo fue enviado automáticamente por el backend de CleenGo.
      </p>
    `;

    const text = `¡Hola, ${name}!
Gracias por registrarte como ${roleLabel} en CleenGo.`;

    try {
      this.nodemailerService.sendMail({
        to,
        subject,
        html,
        text,
      });
    } catch (error: any) {
      this.logger.error(
        `❌ Error enviando email de bienvenida a ${to}: ${error.message}`,
      );
    }
  }

  //? -------- Recuperar contraseña (solicitud) --------
  async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });

    // Siempre respondemos lo mismo por seguridad
    if (!user) {
      this.logger.warn(
        `Solicitud de reset de contraseña para email no registrado: ${email}`,
      );

      return {
        message:
          '✅ Si el email está registrado, se ha enviado un enlace para restablecer la contraseña',
      };
    }

    const payload = {
      sub: user.id,
      email: user.email,
      type: 'password-reset',
    };

    const expiresIn = '30m';
    const token = this.jwtService.sign(payload, { expiresIn });

    const expirationTime = 30; // minutos (para el texto del mail)

    const frontUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${frontUrl}/reset-password?token=${token}`;

    const subject = 'Restablecer tu contraseña en CleenGo 🔐';

    const html = `
      <h1>Hola, ${user.name} 👋</h1>
      <p>Recibimos una solicitud para restablecer tu contraseña de <strong>CleenGo</strong>.</p>
      <p>Haz clic en el siguiente botón para continuar:</p>
      <p>
        <a href="${resetUrl}"
          style="
            display:inline-block;
            padding: 10px 18px;
            background-color:#16a34a;
            color:#ffffff;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          ">
          Restablecer contraseña
        </a>
      </p>
      <p>Si no fuiste tú, puedes ignorar este correo. El enlace expirará en ${expirationTime} minutos.</p>
      <hr />
      <p style="font-size: 12px; color: #888;">
        Este correo fue enviado automáticamente por el backend de CleenGo.
      </p>
    `;

    const text = `
Hola, ${user.name}.

Recibimos una solicitud para restablecer tu contraseña de CleenGo.
Enlace para restablecer (cópialo en tu navegador):

${resetUrl}

Si no fuiste tú, puedes ignorar este correo. El enlace expira en ${expirationTime} minutos.
    `;

    try {
      this.nodemailerService.sendMail({
        to: user.email,
        subject,
        html,
        text,
      });
    } catch (error: any) {
      this.logger.error(
        `❌ Error enviando email de restablecimiento a ${user.email}: ${error.message}`,
      );
    }

    return {
      message:
        '✅ Si el email está registrado, se ha enviado un enlace para restablecer la contraseña',
    };
  }

  //? -------- Restablecer contraseña (aplicar nuevo password) --------
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        '⚠️ La nueva contraseña y su confirmación no coinciden',
      );
    }

    let payload: any;

    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new BadRequestException('⚠️ Token inválido o expirado');
    }

    if (payload.type !== 'password-reset') {
      throw new BadRequestException(
        '⚠️ Token inválido para restablecer contraseña',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new BadRequestException('⚠️ Usuario no encontrado');
    }

    const { error: updateError } =
      await this.supabaseClient.auth.admin.updateUserById(user.passwordUrl, {
        password: newPassword,
      });

    if (updateError) {
      this.logger.error(
        `❌ Error actualizando contraseña en Supabase para usuario ${user.email}: ${updateError.message}`,
      );
      throw new BadRequestException(
        '⚠️ No se pudo restablecer la contraseña. Inténtalo más tarde.',
      );
    }

    return {
      message: '✅ Contraseña restablecida correctamente',
    };
  }
}
