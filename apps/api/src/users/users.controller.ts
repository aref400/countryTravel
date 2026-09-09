import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/types/request-with-user.types';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: RequestWithUser) {
    return this.service.getMe(req.user.id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateMe(@Req() req: RequestWithUser, @Body() dto: UpdateMeDto) {
    return this.service.updateMe(req.user.id, dto);
  }

  @Delete('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteMe(@Req() req: RequestWithUser) {
    await this.service.deleteMe(req.user.id);
  }
}
