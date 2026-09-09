import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const publicUser = {
    id: 'user-1',
    email: 'me@test.com',
    username: 'me',
    avatarUrl: null,
    bio: null,
    role: 'user',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getMe', () => {
    it('should return the public profile of the current user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(publicUser);

      const result = await service.getMe('user-1');

      expect(result).toBe(publicUser);
      // select EXACT → prouve qu'aucun champ sensible n'est lu.
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          bio: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMe', () => {
    it('should update profile fields and return the public user (no sensitive fields)', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null); // email + username libres
      mockPrismaService.user.update.mockResolvedValue(publicUser);

      const result = await service.updateMe('user-1', {
        username: 'newname',
        email: 'new@test.com',
        bio: 'Globe-trotter',
        avatarUrl: 'https://cdn.test/a.png',
      });

      expect(result).toBe(publicUser);
      // Un seul update, et le select est EXACT : prouve qu'aucun champ sensible
      // (passwordHash / refreshTokenHash) n'est renvoyé.
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          email: 'new@test.com',
          username: 'newname',
          bio: 'Globe-trotter',
          avatarUrl: 'https://cdn.test/a.png',
        },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          bio: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('should skip uniqueness checks when email/username are not provided', async () => {
      mockPrismaService.user.update.mockResolvedValue(publicUser);

      await service.updateMe('user-1', { bio: 'Juste la bio' });

      expect(mockPrismaService.user.findFirst).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw ConflictException if email is taken by another user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'someone-else',
      });

      await expect(
        service.updateMe('user-1', { email: 'taken@test.com' }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if username is taken by another user', async () => {
      mockPrismaService.user.findFirst
        .mockResolvedValueOnce(null) // email libre
        .mockResolvedValueOnce({ id: 'someone-else' }); // username pris

      await expect(
        service.updateMe('user-1', {
          email: 'free@test.com',
          username: 'taken',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should NOT conflict when the email belongs to the current user (self-exclusion)', async () => {
      // findFirst exclut l'utilisateur courant -> renvoie null -> pas de conflit
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue(publicUser);

      await expect(
        service.updateMe('user-1', { email: 'me@test.com' }),
      ).resolves.toBe(publicUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'me@test.com', NOT: { id: 'user-1' } },
        }),
      );
    });

    describe('changement de mot de passe', () => {
      it('should throw BadRequestException if newPassword is set without currentPassword', async () => {
        await expect(
          service.updateMe('user-1', { newPassword: 'NewPass123' }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw UnauthorizedException if the current password is incorrect', async () => {
        const hash = await bcrypt.hash('the-real-password', 12);
        mockPrismaService.user.findUnique.mockResolvedValue({
          passwordHash: hash,
        });

        await expect(
          service.updateMe('user-1', {
            currentPassword: 'wrong-password',
            newPassword: 'NewPass123',
          }),
        ).rejects.toThrow(UnauthorizedException);
        expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException if the account has no password (OAuth)', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          passwordHash: null,
        });

        await expect(
          service.updateMe('user-1', {
            currentPassword: 'whatever',
            newPassword: 'NewPass123',
          }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should hash the new password and revoke sessions on success', async () => {
        const hash = await bcrypt.hash('current-password', 12);
        mockPrismaService.user.findUnique.mockResolvedValue({
          passwordHash: hash,
        });
        mockPrismaService.user.update.mockResolvedValue(publicUser);

        await service.updateMe('user-1', {
          currentPassword: 'current-password',
          newPassword: 'NewPass123',
        });

        const updateCalls = mockPrismaService.user.update.mock.calls as Array<
          [{ data: { passwordHash: string; refreshTokenHash: string | null } }]
        >;
        const { data } = updateCalls[0][0];
        expect(data.passwordHash).toMatch(/^\$2[aby]\$/); // hash bcrypt, pas le plaintext
        expect(data.refreshTokenHash).toBeNull(); // sessions révoquées
      });
    });
  });

  describe('deleteMe', () => {
    it('should permanently delete the user (RGPD cascade)', async () => {
      mockPrismaService.user.delete.mockResolvedValue({ id: 'user-1' });

      await service.deleteMe('user-1');

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });
  });
});
