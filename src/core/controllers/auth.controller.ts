import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ChangePassword } from '../interfaces/interfaces';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshToken } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() changePassword: ChangePassword) {
    return this.authService.changePassword(changePassword);
  }

  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshToken) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }
}
