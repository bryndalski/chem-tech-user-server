import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDTO } from './dto/CreateUser.dto';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  private logger: Logger;
  private AWS_CLIENT: CognitoIdentityProviderClient;

  constructor(private configService: ConfigService) {
    this.logger = new Logger(AdminService.name);
    this.AWS_CLIENT = new CognitoIdentityProviderClient({
      region: this.configService.get('AWS_DEFAULT_REGION'),
    });
  }

  /**
   * Creates new user in cognito
   * @param user -  user params
   *
   * @returns {Promise<HttpStatus>} Status of operations
   *  - 201 - user created
   *
   * @throws {Error} - when user is not created
   * @throws {InternalServerErrorException} - when error occurs
   * @throws {ConflictException} - when user already exists
   * @throws {ForbiddenException} - when you don't have permission to create user
   */
  createUser(userToCreate: CreateUserDTO, userGroups: string[]) {
    try {
      return 200;
    } catch (error) {}
  }
}
