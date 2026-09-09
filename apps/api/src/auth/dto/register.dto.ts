import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '../../common/validation/is-strong-password.decorator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email doit être valide' })
  @IsNotEmpty({ message: 'Email est requis' })
  email!: string;
  @IsString({ message: 'Username doit être une chaine de caractères' })
  @IsNotEmpty({ message: 'Username est requis' })
  @MinLength(3, { message: 'Username doit avoir au moins 3 caractères' })
  username!: string;
  @IsNotEmpty({ message: 'Password est requis' })
  @IsStrongPassword()
  password!: string;
}
