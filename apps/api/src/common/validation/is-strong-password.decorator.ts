import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MinLength } from 'class-validator';

export function IsStrongPassword() {
  return applyDecorators(
    IsString({ message: 'Password doit être une chaine de caractères' }),
    MinLength(8, { message: 'Password doit avoir au moins 8 caractères' }),
    Matches(/\d/, {
      message: 'Le mot de passe doit contenir au moins un chiffre',
    }),
    Matches(/[A-Z]/, {
      message: 'Le mot de passe doit contenir au moins une majuscule',
    }),
  );
}
