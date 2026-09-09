import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshDto } from './dto/refresh.dto';
import { RequestWithUser } from './types/request-with-user.types';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return user from request', () => {
      // Arrange
      const mockRequest: Partial<RequestWithUser> = {
        user: {
          id: 'user-id',
          email: 'test@test.com',
          username: 'testuser',
          role: 'user',
          avatarUrl: null,
        },
      };

      // Act
      const result = controller.getMe(mockRequest as RequestWithUser);

      // Assert
      expect(result).toEqual(mockRequest.user);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh with correct dto', async () => {
      // Arrange
      const refreshDto: RefreshDto = {
        refreshToken: 'valid-refresh-token',
      };
      const expectedResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockAuthService.refresh.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.refresh(refreshDto);

      // Assert
      expect(mockAuthService.refresh).toHaveBeenCalledWith(refreshDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
