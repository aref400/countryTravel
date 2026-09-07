import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;

  // Mock de PrismaService
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  // Mock de JwtService
  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  // Le constructeur d'AuthService exige ces deux secrets au démarrage.
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Validation de la configuration au démarrage (BUG-11) : une variable de secret
  // manquante doit faire échouer l'instanciation du service, pas planter plus tard
  // à la première requête d'authentification.
  describe('validation des secrets au démarrage', () => {
    const buildModule = () =>
      Test.createTestingModule({
        providers: [
          AuthService,
          { provide: PrismaService, useValue: mockPrismaService },
          { provide: JwtService, useValue: mockJwtService },
        ],
      }).compile();

    it('should throw if JWT_SECRET is missing', async () => {
      const saved = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      await expect(buildModule()).rejects.toThrow('JWT_SECRET');
      process.env.JWT_SECRET = saved;
    });

    it('should throw if JWT_REFRESH_SECRET is missing', async () => {
      const saved = process.env.JWT_REFRESH_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
      await expect(buildModule()).rejects.toThrow('JWT_REFRESH_SECRET');
      process.env.JWT_REFRESH_SECRET = saved;
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@test.com',
      username: 'testuser',
      password: 'password123',
    };

    it('should create a new user and return tokens', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null); // Pas d'utilisateur existant
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        email: registerDto.email,
        username: registerDto.username,
        passwordHash: 'hashed-password',
        role: 'user',
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual({
        user: {
          id: 'user-id',
          email: registerDto.email,
          username: registerDto.username,
          role: 'user',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(2); // Email + username
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          passwordHash: expect.any(String) as string,
          role: 'user',
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should throw ConflictException if username already exists', async () => {
      // Arrange
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // Email n'existe pas
        .mockResolvedValueOnce({
          id: 'existing-user',
          username: registerDto.username,
        }); // Username existe

      await expect(service.register(registerDto)).rejects.toThrow(
        'Username already exists',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@test.com',
      password: 'password123',
    };

    it('should return user and tokens on successful login', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash(loginDto.password, 12);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        username: 'testuser',
        passwordHash: hashedPassword,
        role: 'user',
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual({
        user: {
          id: 'user-id',
          email: loginDto.email,
          username: 'testuser',
          role: 'user',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('wrong-password', 12);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        passwordHash: hashedPassword,
      });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // Rotation + révocation du refresh token : le hash (SHA-256) du refresh token
  // courant est stocké en base. Un refresh n'est accepté que si le token présenté
  // correspond au hash stocké ; le logout met ce hash à null (révocation).
  describe('refresh', () => {
    const refreshDto = { refreshToken: 'valid-refresh-token' };
    const sha256 = (token: string) =>
      createHash('sha256').update(token).digest('hex');

    it('should rotate and return new tokens when the presented token matches the stored hash', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'test@test.com',
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@test.com',
        refreshTokenHash: sha256(refreshDto.refreshToken),
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refresh(refreshDto);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      // rotation : le nouveau hash est persisté
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw when the token is revoked (stored hash is null, ex: après logout)', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'test@test.com',
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@test.com',
        refreshTokenHash: null,
      });

      await expect(service.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when an old token is replayed (hash mismatch)', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'test@test.com',
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@test.com',
        refreshTokenHash: sha256('un-autre-token-plus-recent'),
      });

      await expect(service.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when the token signature is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when the user no longer exists', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'test@test.com',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token by nulling the stored hash', async () => {
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.logout('user-id');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { refreshTokenHash: null },
      });
      expect(result).toEqual({ success: true });
    });
  });
});
