import { Body, Controller, Post, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ChangePassword } from '../interfaces/interfaces';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

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
  changePassword(@Body() changePassword: ChangePassword, ) {
    return this.authService.changePassword(changePassword);
  }
}
