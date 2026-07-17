import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email doit être valide' })
  @IsNotEmpty({ message: 'Email est requis' })
  email!: string;
  @IsString({ message: 'Username doit être une chaine de caractères' })
  @IsNotEmpty({ message: 'Username est requis' })
  @MinLength(3, { message: 'Username doit avoir au moins 3 caractères' })
  username!: string;
  @IsString({ message: 'Password doit être une chaine de caractères' })
  @IsNotEmpty({ message: 'Password est requis' })
  @MinLength(8, { message: 'Password doit avoir au moins 8 caractères' })
  @Matches(/\d/, {
    message: 'Le mot de passe doit contenir au moins un chiffre',
  })
  @Matches(/[A-Z]/, {
    message: 'Le mot de passe doit contenir au moins une majuscule',
  })
  password!: string;
}
