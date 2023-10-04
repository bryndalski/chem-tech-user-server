import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/cognito.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AdminModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
