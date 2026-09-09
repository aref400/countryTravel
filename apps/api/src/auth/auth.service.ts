import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';
import { BCRYPT_ROUNDS } from '../common/security.constants';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

interface JwtPayload {
  sub: string;
  email: string;
}
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET must be defined in the environment');
    }
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET must be defined in the environment');
    }
    this.jwtSecret = jwtSecret;
    this.jwtRefreshSecret = jwtRefreshSecret;
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const existingUsername = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        role: 'user',
      },
    });
    const tokens = await this.generateTokens(newUser.id, newUser.email);
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      this.logger.warn(`Login échoué (email inconnu) : ${dto.email}`);
      throw new UnauthorizedException('User not found');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid user data');
    }
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Login échoué (mot de passe invalide) : ${dto.email}`);
      throw new UnauthorizedException('Invalid password');
    }
    this.logger.log(`Login réussi : ${dto.email}`);
    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { success: true };
  }

  async refresh(dto: RefreshDto) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        dto.refreshToken,
        {
          secret: this.jwtRefreshSecret,
        },
      );
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      if (
        !user.refreshTokenHash ||
        user.refreshTokenHash !== this.hashToken(dto.refreshToken)
      ) {
        throw new UnauthorizedException('Refresh token revoked');
      }
      return this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      // Access token : 15 minutes
      this.jwtService.signAsync(payload, {
        secret: this.jwtSecret,
        expiresIn: '15m',
      }),
      // Refresh token : 7 jours. Le jti unique garantit que deux tokens émis
      // dans la même seconde diffèrent (sinon payload identique = token
      // identique), condition nécessaire à la rotation et à la révocation.
      this.jwtService.signAsync(
        { ...payload, jti: randomUUID() },
        {
          secret: this.jwtRefreshSecret,
          expiresIn: '7d',
        },
      ),
    ]);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: this.hashToken(refreshToken) }, // rotation refresh token : on stocke le hash du refresh token dans la base de données pour vérifier sa validité lors du prochain refresh
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
