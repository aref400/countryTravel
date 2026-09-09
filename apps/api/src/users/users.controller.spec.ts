import { Test, TestingModule } from '@nestjs/testing';
import { RequestWithUser } from '../auth/types/request-with-user.types';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  // Dans les tests de controller, on mock le Service (pas Prisma directement).
  const mockUsersService = {
    getMe: jest.fn(),
    updateMe: jest.fn(),
    deleteMe: jest.fn(),
  };

  const mockReq = { user: { id: 'user-1' } } as RequestWithUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should delegate to service.getMe with the connected user id', async () => {
      const me = { id: 'user-1', username: 'me' };
      mockUsersService.getMe.mockResolvedValue(me);

      const result = await controller.getMe(mockReq);

      expect(result).toBe(me);
      expect(mockUsersService.getMe).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateMe', () => {
    it('should delegate to service.updateMe with the connected user id and dto', async () => {
      const dto = { username: 'newname' };
      const updated = { id: 'user-1', username: 'newname' };
      mockUsersService.updateMe.mockResolvedValue(updated);

      const result = await controller.updateMe(mockReq, dto);

      expect(result).toBe(updated);
      expect(mockUsersService.updateMe).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('deleteMe', () => {
    it('should delegate to service.deleteMe with the connected user id', async () => {
      mockUsersService.deleteMe.mockResolvedValue(undefined);

      await controller.deleteMe(mockReq);

      expect(mockUsersService.deleteMe).toHaveBeenCalledWith('user-1');
    });
  });
});
