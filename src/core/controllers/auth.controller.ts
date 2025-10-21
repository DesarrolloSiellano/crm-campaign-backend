import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ChangePassword } from '../interfaces/interfaces';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(@Body() changePassword: ChangePassword) {
    return this.authService.changePassword(changePassword);
  }
}
