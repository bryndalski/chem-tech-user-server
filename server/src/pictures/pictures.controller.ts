import { AllowedRoles, User } from '@/decorators';
import { Roles } from '@/enums';
import { CognitoAtuhGuard, CognitoRolesGuard } from '@/guards';
import { parseImagePipe } from '@/pipes/ImageParse.pipe';
import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PicturesService } from './pictures.service';
import { PostPicrureResponse } from './responses/PostPicture.dto';

@Controller('pictures')
@ApiTags('pictures')
@UseGuards(new CognitoAtuhGuard())
export class PicturesController {
  constructor(private readonly picturesService: PicturesService) {}

  @Post('upload-picture')
  @Version('1')
  @AllowedRoles([Roles.ADMIN, Roles.SYSTEM_ADMIN, Roles.USER])
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Uploads new photo for user - (Admin, System Admin, User)',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @ApiForbiddenResponse({
    description: 'You are not allowed to post photos',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBody({
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        profilePicture: {
          description:
            "user profile picture. Must be in JPG/JPEG/PNG format and can't be bigger than 5MB",
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Photo has been uploaded',
    type: PostPicrureResponse,
  })
  @UseGuards(CognitoRolesGuard)
  @UseInterceptors(FileInterceptor('profilePicture'))
  create(
    @User() user: string,
    @UploadedFile(parseImagePipe) profilePicture: Express.Multer.File,
  ) {
    return this.picturesService.uploadPicture(profilePicture.buffer, user);
  }
}
