import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminModule } from './admin.module';
import { INestApplication } from '@nestjs/common';

describe('AdminController', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdminModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });
  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Create enspoint - full test', () => {
    describe('Security tests', () => {
      it('401 when no token is provided', async () => {});
      it('403 when token is provided but user is not admin or system admin', async () => {});
      it('400 with role admin', async () => {});
      it('400 with role system admin', async () => {});
      it('403 when user trying to create admin', async () => {});
      it('403 when admin trying to create admin', async () => {});
      it('403 when system admin creates system admin', async () => {});
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
    describe('Creation', () => {
      it('201 when all data is and user is created', async () => {});
      it('409 when email is already taken', async () => {});
      it('409 when phone number is already taken', async () => {});
      it('201 when system admin creates admin', async () => {});
    });
  });
});
