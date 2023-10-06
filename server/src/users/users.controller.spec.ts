import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { JwtStrategy } from '@/strategies/cognito.strategy';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import {
  CognitoLogin,
  ICognitoLoginInterface,
} from '../../test/common/cognitoLogin';
import * as request from 'supertest';

describe('UsersController', () => {
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
        UsersModule,
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

  describe('GET /users', () => {
    describe('Security checks', () => {
      it('should return 401 if no token is provided', async () => {
        await request(app.getHttpServer())
          .get('/users')
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it('Should return 401 when token is invalid', async () => {
        await request(app.getHttpServer())
          .get('/users')
          .set('Authorization', 'Bearer ' + 'accestoken123123123')
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it('403 when user has no roles', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .set('Authorization', `Bearer ${accessTokens['no_roles']}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it('403 when user with guest role requests', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .set('Authorization', `Bearer ${accessTokens['guest']}`)
          .expect(HttpStatus.FORBIDDEN);
      });
    });

    describe.each([
      ['user', HttpStatus.FORBIDDEN],
      ['admin', HttpStatus.OK],
      ['system_admin', HttpStatus.OK],
    ])('Security checks - %s -secure groups', (role, code) => {
      it.each([
        ['phone_number'],
        ['groups'],
        ['active'],
        ['email', 'phone_number'],
        ['email', 'groups'],
        ['email', 'active'],
        ['phone_number', 'groups'],
        ['phone_number', 'active'],
        ['groups', 'active'],
        ['email', 'phone_number', 'groups'],
        ['email', 'phone_number', 'active'],
        ['email', 'groups', 'active'],
        ['phone_number', 'groups', 'active'],
        ['email', 'phone_number', 'groups', 'active'],
      ])(`${code} when %s requests`, async (requestedField) => {
        await request(app.getHttpServer())
          .get(`/users`)
          .query({ requestedFields: [requestedField] })
          .set('Authorization', `Bearer ${accessTokens[role]}`)
          .expect(code);
      });
      it('200 when param is not provided', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .set('Authorization', `Bearer ${accessTokens[role]}`)
          .expect(HttpStatus.OK);
      });
    });

    describe;
  });
});
