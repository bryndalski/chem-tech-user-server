import { Controller, Post, UseGuards, Version } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags } from '@nestjs/swagger';
import { CognitoAtuhGuard, CognitoRolesGuard } from '@/guards';
import { AllowedRoles } from '@/decorators';
import { Roles } from '@enums/index';

@Controller('admin')
@ApiTags('admin')
@UseGuards(CognitoAtuhGuard, CognitoRolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @Version('1')
  @AllowedRoles([Roles.ADMIN])
  create() {
    return 200;
  }
}
