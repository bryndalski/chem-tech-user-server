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
    ])('Security checks - %o -secure groups', (role, code) => {
      it.each([
        [['phone_number']],
        [['email', 'phone_number']],
        [['name', 'phone_number']],
        [['picture', 'phone_number']],
      ])(`${code} when %o requests`, async (requestedField) => {
        await request(app.getHttpServer())
          .get(`/users`)
          .query({ requestedFields: [requestedField], limit: 10 })
          .set('Authorization', `Bearer ${accessTokens[role]}`)
          .expect(code);
      });
    });

    describe('Formatter test', () => {
      it('should have all properties', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .query({
            requestedFields: ['phone_number', 'name', 'picture', 'email'],
            limit: 10,
          })
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .expect((res) => {
            expect(res.body).toHaveProperty('users');
            expect(res.body.users[0]).toHaveProperty('phone_number');
            expect(res.body.users[0]).toHaveProperty('name');
            expect(res.body.users[0]).toHaveProperty('picture');
            expect(res.body).toHaveProperty('paginationToken');
          });
      });

      it('without phone_number', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .query({
            requestedFields: ['name', 'picture', 'email'],
            limit: 10,
          })
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .expect((res) => {
            expect(res.body).toHaveProperty('users');
            expect(res.body.users[0]).not.toHaveProperty('phone_number');
            expect(res.body.users[0]).toHaveProperty('name');
            expect(res.body.users[0]).toHaveProperty('picture');
            expect(res.body).toHaveProperty('paginationToken');
          });
      });
      it('without phone_number and name', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .query({
            requestedFields: ['picture', 'email'],
            limit: 10,
          })
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toHaveProperty('users');
            expect(res.body.users[0]).not.toHaveProperty('phone_number');
            expect(res.body.users[0]).not.toHaveProperty('name');
            expect(res.body.users[0]).toHaveProperty('picture');
            expect(res.body.users[0]).toHaveProperty('email');
            expect(res.body).toHaveProperty('paginationToken');
          });
      });
    });

    describe('request formats', () => {
      it('400 when non params are provided', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('400 when only requestFileds are provided', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('400 when only limit is provided', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .query({ limit: 10 })
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('400 when limit is not a number', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .query({ limit: '10' })
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('400 when limit is lowwer than 1', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .query({ limit: 0 })
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('400 when limit is higher than 10', async () => {
        await request(app.getHttpServer())
          .get(`/users`)
          .query({ limit: 11 })
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
  });
});
