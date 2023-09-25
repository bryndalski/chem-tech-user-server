import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtCognitoStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _audience: configService.get('AWS_COGNITO_CLIENT_ID'),
      issuer: configService.get('AWS_COGNITO_AUTHORITY'),
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${configService.get(
          'AWS_COGNITO_AUTHORITY',
        )}/.well-known/jwks.json`,
      }),
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-explicit-any
  async validate(payload: any) {
    return {
      username: payload.username,
      groups: payload['cognito:groups'] || [],
      clientId: payload.client_id,
    };
  }
}
