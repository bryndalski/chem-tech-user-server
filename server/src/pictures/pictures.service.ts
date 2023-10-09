import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { PostPicrureResponse } from './responses/PostPicture.dto';
@Injectable()
export class PicturesService {
  private logger: Logger;
  private awsS3Bucket: S3Client = new S3Client({
    region: this.configService.get('AWS_DEFAULT_REGION'),
  });
  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(PicturesService.name);
  }

  /**
   * Uploads picture to S3 bucket. Uses uuid as key
   * @param picture
   * @returns {Promise<{ Key: string }>} - Key of uploaded picture
   */
  async uploadPicture(
    picture: Buffer,
    user: string,
  ): Promise<PostPicrureResponse> {
    try {
      const Key = uuidv4();
      const uploadObject = new PutObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key,
        Body: picture,
        Metadata: {
          Author: user,
        },
      });
      await this.awsS3Bucket.send(uploadObject);
      return { pictureKey: Key };
    } catch (error) {
      this.logger.error({
        method: 'uploadPicture',
        message: 'Error while uploading picture',
        error: error,
      });
      throw new InternalServerErrorException();
    }
  }
}
