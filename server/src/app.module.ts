import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/cognito.strategy';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PicturesModule } from './pictures/pictures.module';

@Module({
  imports: [
    AdminModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    PicturesModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
