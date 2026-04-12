import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString({ message: 'Refresh token doit être une chaine de caractère' })
  @IsNotEmpty({ message: 'Refresh token est requis' })
  refreshToken!: string;
}
