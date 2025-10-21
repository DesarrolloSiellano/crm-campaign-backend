import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChangePassword } from '../interfaces/interfaces';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async changePassword(changePassword: ChangePassword) {
    const userResponse = await firstValueFrom(
      this.userClient.send({ cmd: 'changePassword' }, changePassword),
    );

    return userResponse;
  }
}
