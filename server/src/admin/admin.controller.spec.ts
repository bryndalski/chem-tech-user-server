import { Test, TestingModule } from '@nestjs/testing';
import { AdminModule } from './admin.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtCognitoStrategy } from '@/strategies/cognito.strategy';
import { CognitoLogin } from 'test/common/cognitoLogin';
import { ICognitoLoginInterface } from '../../test/common/cognitoLogin';

describe('AdminController', () => {
  let app: INestApplication;
  const accessTokens = {
    guest: '',
    user: '',
    admin: '',
    system_admin: '',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AdminModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule.forRoot(),
      ],
      providers: [JwtCognitoStrategy],
    }).compile();
    app = moduleFixture.createNestApplication();

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

  describe('Create enspoint - full test', () => {
    describe('Security tests', () => {
      it('401 when no token is provided', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it('403 when token is provided but user is not admin or system admin', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', 'Bearer ' + 'token')
          .expect(HttpStatus.FORBIDDEN);
      });
      it.each(['user', 'guest', 'no_role'])(
        "403 when user has role '%s'",
        async (userType) => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens[userType] as string}`)
            .expect(HttpStatus.FORBIDDEN);
        },
      );
      it('400 with role admin', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
      it('400 with role system admin', async () => {
        const accessToken = await CognitoLogin({
          userType: 'system_admin',
        } as ICognitoLoginInterface);

        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', `Bearer ${accessToken as string}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('Validation tests - negative tests', () => {
      describe('full name', () => {
        it('400 when fullName is not provided', async () => {});
        it('400 when fullName is empty', async () => {});
        it('400 when fullName is less than 3 characters', async () => {});
        it('400 when fullName is more than 100 characters', async () => {});
      });

      describe('email', () => {
        it('400 when email is not provided', async () => {});
        it('400 when email is empty', async () => {});
        it('400 when email is not valid', async () => {});
      });

      describe('userRole', () => {
        it('400 when userRole is not provided', async () => {});
        it('400 when userRole is empty', async () => {});
        it('400 when userRole is not valid', async () => {});
      });

      describe('phone number', () => {
        it('400 when phoneNumber is not provided', async () => {});
        it('400 when phoneNumber is empty', async () => {});
        it('400 when phoneNumber is not valid', async () => {});
      });
    });

    describe('Creation - system admin', () => {
      it('201 when user is created', async () => {});
      it('201 when admin is created', async () => {});
      it('201 when guest is created', async () => {});
      it('403 when system admin is created', async () => {});
    });

    describe('Creation - admin', () => {
      it('201 when user is created', async () => {});
      it('201 when guest is created', async () => {});
      it('403 when admin is created', async () => {});
      it('403 when system admin is created', async () => {});
    });

    describe('Conflict tests', () => {
      it('409 when email is already taken', async () => {});
      it('409 when phone number is already taken', async () => {});
      it('403 when admin trying to create admin', async () => {});
      it('403 when system admin creates system admin', async () => {});
    });
  });
});
