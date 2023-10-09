import { Module } from '@nestjs/common';
import { PicturesService } from './pictures.service';
import { PicturesController } from './pictures.controller';

@Module({
  providers: [PicturesService],
  controllers: [PicturesController],
})
export class PicturesModule {}
