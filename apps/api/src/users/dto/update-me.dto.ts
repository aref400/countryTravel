import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsStrongPassword } from '../../common/validation/is-strong-password.decorator';

// Tous les champs sont optionnels : l'utilisateur ne modifie que ce qu'il envoie.
export class UpdateMeDto {
  @IsOptional()
  @IsString({ message: 'Username doit être une chaine de caractères' })
  @MinLength(3, { message: 'Username doit avoir au moins 3 caractères' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'Bio doit être une chaine de caractères' })
  @MaxLength(500, { message: 'Bio ne peut pas dépasser 500 caractères' })
  bio?: string;

  @IsOptional()
  @IsUrl({}, { message: 'avatarUrl doit être une URL valide' })
  avatarUrl?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email doit être valide' })
  email?: string;

  // Requis uniquement quand newPassword est fourni (vérifié côté service).
  @IsOptional()
  @IsString({ message: 'currentPassword doit être une chaine de caractères' })
  currentPassword?: string;

  @IsOptional()
  @IsStrongPassword()
  newPassword?: string;
}
