import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      this.logger.error('JwtAuthGuard Error', {
        err,
        info,
        userId: user?._id,
      });
      // Si info contiene TokenExpiredError, enviamos un mensaje específico
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('SESSION_EXPIRED');
      }

      // Para cualquier otro error de autenticación (token inválido, mal formado, etc.)
      throw new UnauthorizedException(err?.message || 'UNAUTHORIZED');
    }

    this.logger.log(`Authentication Success for user: ${user?._id}`);
    return user;
  }
}
