import { JwtStrategy } from '@/strategies/cognito.strategy';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CognitoLogin,
  ICognitoLoginInterface,
} from '../../test/common/cognitoLogin';
import { PicturesModule } from './pictures.module';
import * as request from 'supertest';

describe('PicturesController', () => {
  let app: INestApplication;

  const accessTokens = {
    guest: '',
    user: '',
    admin: '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    system_admin: '',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PicturesModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [JwtStrategy, ConfigService],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    accessTokens.guest = (await CognitoLogin({
      userType: 'guest',
    } as ICognitoLoginInterface)) as string;
    accessTokens.user = (await CognitoLogin({
      userType: 'user',
    } as ICognitoLoginInterface)) as string;
    accessTokens.admin = (await CognitoLogin({
      userType: 'admin',
    } as ICognitoLoginInterface)) as string;
    accessTokens.system_admin = (await CognitoLogin({
      userType: 'system_admin',
    } as ICognitoLoginInterface)) as string;

    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Security tests', () => {
    describe('Security tests', () => {
      it('401 when no token is provided', async () => {
        await request(app.getHttpServer())
          .post(`/pictures/upload-picture`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it('401 when token is provided but not valid', async () => {
        await request(app.getHttpServer())
          .post(`/pictures/upload-picture`)
          .set('Authorization', 'Bearer ' + 'accestoken123123123')
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it.each(['admin', 'system_admin', 'user'])(
        "400 when user has role '%s'",
        async (userType) => {
          await request(app.getHttpServer())
            .post(`/pictures/upload-picture`)
            .set('Authorization', `Bearer ${accessTokens[userType] as string}`)
            .expect(HttpStatus.BAD_REQUEST);
        },
      );
      it('401 when user has no roles', async () => {
        await request(app.getHttpServer())
          .post(`/pictures/upload-picture`)
          .set('Authorization', `Bearer ${accessTokens['no_roles']}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });
});
