import { Controller, Get, Query, UseGuards, Version } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AllowedRoles, Groups } from '@/decorators';
import { Roles } from '@/enums';
import { CognitoAtuhGuard, CognitoRolesGuard } from '@/guards';
import { RequestUsersDTO } from './dto/RequestUsers.dto';
import { UsersService } from './users.service';
import { RequestUserResponse } from './response/RequestUser.response';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(new CognitoAtuhGuard())
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('')
  @Version('1')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiOperation({
    summary: 'Get users',
  })
  @ApiOkResponse({
    description: 'Users',
    type: () => RequestUserResponse,
  })
  @UseGuards(CognitoRolesGuard)
  @AllowedRoles([Roles.ADMIN, Roles.SYSTEM_ADMIN, Roles.USER])
  getUsers(@Query() params: RequestUsersDTO, @Groups() groups: Roles[]) {
    return this.userService.getUsers(params, groups);
  }
}
