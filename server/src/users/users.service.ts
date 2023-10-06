import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RequestUsersDTO } from './dto/RequestUsers.dto';
import { Roles } from '@/enums';
import { RequestedFields } from './enums/RequestedFields.enum';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private logger: Logger;
  private AWS_CLIENT: CognitoIdentityProviderClient;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger('UsersService');
  }

  /**
   * Get user details
   * @param details
   * @returns {User} - user details
   * @throws {ForbiddenException} - when user tries to access forbidden fields
   * @throws {NotFoundException} - when user is not found
   * @throws {InternalServerErrorException} - when error occurs
   *
   */
  async getUsers(details: RequestUsersDTO, groups: Roles[]) {
    try {
      if (
        //Run checks if user is not admin or system admin
        !groups.includes(Roles.ADMIN) ||
        !groups.includes(Roles.SYSTEM_ADMIN)
      ) {
        if (
          details.requestedFields.includes(RequestedFields.user_groups) ||
          details.requestedFields.includes(RequestedFields.active) ||
          details.requestedFields.includes(RequestedFields.phone_number)
        ) {
          this.logger.warn({
            method: 'getUsers',
            message: `User with groups: ${groups} requested fields: ${details.requestedFields}`,
          });
          throw new ForbiddenException(`You can not access this field`);
        }
        this.logger.debug({
          method: 'getUsers',
          message: `User with groups: ${groups} requested fields: ${details.requestedFields}`,
        });
        const input = {
          UserPoolId: this.configService.get('AWS_COGNITO_USER_POOL_ID'), // required
          AttributesToGet: [...details.requestedFields],
        };
        const command = new ListUsersCommand(input);
        const result = await this.AWS_CLIENT.send(command);
        this.logger.debug({
          method: 'getUsers',
          message: `User with groups: ${groups} requested fields: ${details.requestedFields}`,
          result,
        });
        return HttpStatus.OK;
      }
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      this.logger.error({
        method: 'getUsers',
        message: `User with groups: ${groups} requested fields: ${details.requestedFields}`,
        error,
      });
      throw new InternalServerErrorException();
    }
  }
}
