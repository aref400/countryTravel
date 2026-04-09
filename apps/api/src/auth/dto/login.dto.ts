import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email doit être valide' })
  @IsNotEmpty({ message: 'Email est requis' })
  email!: string;
  @IsString({ message: 'Password doit être une chaine de caractères' })
  @IsNotEmpty({ message: 'Password est requis' })
  password!: string;
}
