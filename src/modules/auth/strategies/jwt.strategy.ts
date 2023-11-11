import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../../../models';
import { environment as env } from '../../../config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload, done: Function) {
    try {
      const { id } = payload;
      // We use this to also attach the user object to the request context.
      const user: IUser = await this.authService.getAuthenticatedUser(
        id,
      );
      if (!user) {
        return done(new UnauthorizedException('unauthorized'), false);
      } else {
        done(null, user);
      }
    } catch (err) {
      console.error(err);
      return done(
        new UnauthorizedException('unauthorized', err.message),
        false,
      );
    }
  }
}
