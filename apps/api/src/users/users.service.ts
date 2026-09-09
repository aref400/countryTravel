import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../common/security.constants';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

// Champs exposés publiquement : jamais passwordHash ni refreshTokenHash.
const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  username: true,
  avatarUrl: true,
  bio: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lecture de son propre profil (pour l'afficher / le pré-remplir à l'édition). */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    if (dto.email) {
      await this.assertUnique(
        { email: dto.email },
        userId,
        'Email already in use',
      );
    }
    if (dto.username) {
      await this.assertUnique(
        { username: dto.username },
        userId,
        'Username already in use',
      );
    }
    const passwordUpdate = await this.buildPasswordUpdate(userId, dto);

    // Un seul update : les champs `undefined` sont ignorés par Prisma.
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.email,
        username: dto.username,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        ...passwordUpdate,
      },
      select: PUBLIC_USER_SELECT,
    });
  }

  async deleteMe(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  /**
   * Vérifie qu'aucun AUTRE utilisateur n'occupe déjà cette valeur unique
   * (email ou username). L'utilisateur courant est exclu de la recherche.
   */
  private async assertUnique(
    where: { email: string } | { username: string },
    currentUserId: string,
    message: string,
  ): Promise<void> {
    const owner = await this.prisma.user.findFirst({
      where: { ...where, NOT: { id: currentUserId } },
      select: { id: true },
    });
    if (owner) throw new ConflictException(message);
  }

  private async buildPasswordUpdate(
    userId: string,
    dto: UpdateMeDto,
  ): Promise<{ passwordHash?: string; refreshTokenHash?: null }> {
    if (!dto.newPassword) return {};
    if (!dto.currentPassword) {
      throw new BadRequestException(
        'Current password is required to set a new password',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash) {
      // Compte sans mot de passe (ex. OAuth) : rien à comparer.
      throw new BadRequestException('No password is set on this account');
    }

    const isCurrentValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    return {
      passwordHash: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS),
      refreshTokenHash: null,
    };
  }
}
