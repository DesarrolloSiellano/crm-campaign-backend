import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, lastValueFrom } from "rxjs";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        configService: ConfigService,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

        });
    }


    async validate(payload: JwtPayload): Promise<JwtPayload> {
        const { _id } = payload;
        const user = await lastValueFrom(
            this.userClient.send({ cmd: 'findUserById' }, _id),
        );

        if (!user) {
            throw new UnauthorizedException('Token no valid');
        }
        if (!user.isActived) {
            throw new UnauthorizedException('User is not active, please talk to the administrator');
        }
        return user;
    }
}