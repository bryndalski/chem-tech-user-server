import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CognitoAtuhGuard, CognitoRolesGuard } from '@/guards';
import { AllowedRoles } from '@/decorators';
import { Roles } from '@enums/index';
import { CreateUserDTO } from './dto/CreateUser.dto';
import { Groups } from '@/decorators/groups.decorator';

@Controller('admin')
@ApiTags('admin')
@UseGuards(new CognitoAtuhGuard())
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @Version('1')
  @AllowedRoles([Roles.ADMIN, Roles.SYSTEM_ADMIN])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Creates new user. (Admin, System Admin)',
  })
  @ApiBody({
    description: 'Register new user to cognito - required params',
    type: CreateUserDTO,
  })
  @ApiCreatedResponse({
    description: 'User created',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @ApiConflictResponse({
    description:
      'User already exists. Both email and phone number must be unique',
  })
  @ApiForbiddenResponse({
    description: 'You are not allowed to create user with this role',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @UseGuards(CognitoRolesGuard)
  create(@Body() createUser: CreateUserDTO, @Groups() userGroups: string[]) {
    return this.adminService.createUser(createUser, userGroups);
  }
}
