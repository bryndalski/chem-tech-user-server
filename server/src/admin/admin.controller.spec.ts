import { Test, TestingModule } from '@nestjs/testing';
import { AdminModule } from './admin.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtStrategy } from '@/strategies/cognito.strategy';
import { CognitoLogin } from '../../test/common/cognitoLogin';
import { ICognitoLoginInterface } from '../../test/common/cognitoLogin';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import {
  AdminDeleteUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

describe('AdminController', () => {
  let app: INestApplication;
  let AWS_CLIENT: CognitoIdentityProviderClient;

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
        AdminModule,
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

    //login to cognito
    AWS_CLIENT = new CognitoIdentityProviderClient({
      region: process.env.AWS_DEFAULT_REGION,
    });

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
      it('401 when token is provided but not valid', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', 'Bearer ' + 'accestoken123123123')
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it('401 when user has no roles', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', `Bearer ${accessTokens['no_roles']}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it.each(['user', 'guest'])(
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
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', `Bearer ${accessTokens['system_admin']}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('Validation tests - negative tests', () => {
      describe('full name', () => {
        it('400 when fullName is not provided', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain(
                'fullName must be shorter than or equal to 100 characters',
              );
              expect(res.body.message).toContain(
                'fullName should not be empty',
              );
              expect(res.body.message).toContain(
                'fullName must be longer than or equal to 3 characters',
              );
            });
        });
        it('400 when fullName is empty', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain(
                'fullName must be shorter than or equal to 100 characters',
              );
              expect(res.body.message).toContain(
                'fullName should not be empty',
              );
              expect(res.body.message).toContain(
                'fullName must be longer than or equal to 3 characters',
              );
            });
        });
        it('400 when fullName is less than 3 characters', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({
              fullName: 'aa',
            })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain(
                'fullName must be longer than or equal to 3 characters',
              );
            });
        });
        it('400 when fullName is more than 100 characters', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({
              fullName: 'a'.repeat(101),
            })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toBeInstanceOf(Array);
              expect(res.body.message).toContain(
                'fullName must be shorter than or equal to 100 characters',
              );
            });
        });
      });

      describe('email', () => {
        it('400 when email is not provided', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain('email should not be empty');
              expect(res.body.message).toContain('email must be an email');
            });
        });
        it('400 when email is empty', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({ email: '' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain('email should not be empty');
              expect(res.body.message).toContain('email must be an email');
            });
        });
        it('400 when email is not valid', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({ email: 'fakeemail' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain('email must be an email');
            });
        });
        it('should say nothing about email when email is valid', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({ email: 'validemail@mail.com' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).not.toContain(
                'email should not be empty',
              );
              expect(res.body.message).not.toContain('email must be an email');
            });
        });
      });

      describe('userRole', () => {
        it('400 when userRole is not provided', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain(
                'userRole should not be empty',
              );
              expect(res.body.message).toContain(
                'userRole must be one of the following values: admin, user, guest, system_admin',
              );
            });
        });
        it('400 when userRole is empty', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({ userRole: '' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain(
                'userRole should not be empty',
              );
              expect(res.body.message).toContain(
                'userRole must be one of the following values: admin, user, guest, system_admin',
              );
            });
        });
        it('400 when userRole is not valid', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({ userRole: 'invalidRole' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain(
                'userRole must be one of the following values: admin, user, guest, system_admin',
              );
            });
        });

        it('should say nothing about userRole when userRole is valid', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({ userRole: 'admin' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).not.toContain(
                'userRole should not be empty',
              );
              expect(res.body.message).not.toContain(
                'userRole must be one of the following values: admin, user, guest, system_admin',
              );
            });
        });
      });

      describe('phone number', () => {
        it('400 when phoneNumber is not provided', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain(
                'phoneNumber should not be empty',
              );
              expect(res.body.message).toContain(
                'phoneNumber must be a valid phone number',
              );
            });
        });
        it('400 when phoneNumber is empty', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({ phoneNumber: '' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain(
                'phoneNumber should not be empty',
              );
              expect(res.body.message).toContain(
                'phoneNumber must be a valid phone number',
              );
            });
        });
        it('400 when phoneNumber is not valid', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({ phoneNumber: '123132sss' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).toContain(
                'phoneNumber must be a valid phone number',
              );
            });
        });
        it('should say nothing about phoneNumber when phoneNumber is valid [country prefix PL]', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({ phoneNumber: '+48123123123' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).not.toContain(
                'phoneNumber should not be empty',
              );
              expect(res.body.message).not.toContain(
                'phoneNumber must be a valid phone number',
              );
            });
        });
        it('should say nothing about phoneNumber when phoneNumber is valid [country prefix none]', async () => {
          await request(app.getHttpServer())
            .post(`/admin/create`)
            .set('Authorization', `Bearer ${accessTokens['admin']}`)
            .send({ phoneNumber: '123123123' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
              expect(res.body.message).not.toContain(
                'phoneNumber must be a valid phone number',
              );
              expect(res.body.message).not.toContain(
                'phoneNumber should not be empty',
              );
            });
        });
      });
    });

    describe('Creation - system admin', () => {
      it('403 when system admin is created', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', `Bearer ${accessTokens['system_admin']}`)
          .send({
            fullName: 'John Doe',
            email: 'johndoe@mail.com',
            userRole: 'system_admin',
            phoneNumber: '+48123123123',
          })
          .expect(HttpStatus.FORBIDDEN)
          .expect((res) => {
            expect(res.body.message).toContain(
              'You are not allowed to create user with this role',
            );
          });
      });
    });

    describe('Creation - admin', () => {
      it('403 when system admin is created', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .send({
            fullName: 'John Doe',
            email: 'johndoe@mail.com',
            userRole: 'system_admin',
            phoneNumber: '+48123123123',
          })
          .expect(HttpStatus.FORBIDDEN)
          .expect((res) => {
            expect(res.body.message).toContain(
              'You are not allowed to create user with this role',
            );
          });
      });

      it('403 when admin is created', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', `Bearer ${accessTokens['system_admin']}`)
          .send({
            fullName: 'John Doe',
            email: 'johndoe@mail.com',
            userRole: 'system_admin',
            phoneNumber: '+48123123123',
          })
          .expect(HttpStatus.FORBIDDEN)
          .expect((res) => {
            expect(res.body.message).toContain(
              'You are not allowed to create user with this role',
            );
          });
      });
    });

    describe('Conflict tests', () => {
      it('409 when email is already taken', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .send({
            fullName: 'John Doe',
            email: 'taken@mail.com', //THIS MAIL IS ALREADY TAKEN
            userRole: 'user',
            phoneNumber: '+48123123123',
          })
          .expect(HttpStatus.CONFLICT)
          .expect((res) => {
            expect(res.body.message).toContain('User already exists');
          });
      });

      it('409 when phone number is already taken', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', `Bearer ${accessTokens['system_admin']}`)
          .send({
            fullName: 'John Doe',
            email: 'randomMail@mail.com',
            userRole: 'user',
            phoneNumber: '+48333333333', //THIS PHONE NUMBER IS ALREADY TAKEN !!! DONT CHANGE IT
          })
          .expect(HttpStatus.CONFLICT)
          .expect((res) => {
            expect(res.body.message).toContain('User already exists');
          });
      });
    });

    describe('Positive scenario', () => {
      afterAll(async () => {
        await AWS_CLIENT.send(
          new AdminDeleteUserCommand({
            UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
            Username: 'notTaken@mail.com',
          }),
        );
      });

      it('201 when user is created', async () => {
        await request(app.getHttpServer())
          .post(`/admin/create`)
          .set('Authorization', `Bearer ${accessTokens['admin']}`)
          .send({
            fullName: 'John Doe',
            email: 'notTaken@mail.com',
            userRole: 'user',
            phoneNumber: '+48380632212',
          })
          .expect(HttpStatus.CREATED);
      });
    });
  });
});
