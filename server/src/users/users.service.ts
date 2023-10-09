import {
  ForbiddenException,
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
import { v4 as uuidv4 } from 'uuid';
import { RequestUserSerializer } from './serializers/RequestUsers.serializer';
import { RequestUserResponse } from './response/RequestUser.response';
@Injectable()
export class UsersService {
  private logger: Logger;
  private AWS_CLIENT: CognitoIdentityProviderClient;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger('UsersService');
    this.AWS_CLIENT = new CognitoIdentityProviderClient({
      region: this.configService.get('AWS_DEFAULT_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
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
  async getUsers(
    details: RequestUsersDTO,
    groups: Roles[],
  ): Promise<RequestUserResponse> {
    try {
      if (
        //Run checks if user is not admin or system admin
        !groups.includes(Roles.ADMIN) &&
        !groups.includes(Roles.SYSTEM_ADMIN)
      )
        if (details.requestedFields.includes(RequestedFields.phone_number)) {
          this.logger.warn({
            method: 'getUsers',
            message: `User with groups: ${groups} requested fields: ${details.requestedFields}`,
          });
          throw new ForbiddenException(`You can not access this field`);
        }

      this.logger.debug({
        method: 'getUsers',
        message: `User with groups: ${groups} requested fields: ${details.requestedFields}`,
        atributed: details.requestedFields,
      });
      this.logger.debug({
        method: 'getUsers',
        message: `User with groups: ${groups} requested fields: ${details.requestedFields}`,
        AttributesToGet: [...details.requestedFields],
      });
      //Create cognito token
      const command = new ListUsersCommand({
        UserPoolId: this.configService.get('AWS_COGNITO_USER_POOL_ID'), // required
        AttributesToGet: [...details.requestedFields],
        Limit: details.limit,
        ...(details.paginationToken && {
          PaginationToken: details.paginationToken,
        }),
      });
      const result = await this.AWS_CLIENT.send(command);
      const users = result.Users.map((user) =>
        this.prepareResult(user.Attributes, details),
      );
      //Format result
      this.logger.debug({
        method: 'getUsers',
        message: `User with groups: ${groups} requested fields: ${details.requestedFields}`,
        result,
      });
      return {
        paginationToken: result.PaginationToken || null,
        users,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      const errorId = uuidv4();
      this.logger.error({
        errorId,
        method: 'getUsers',
        message: `User with groups: ${groups} requested fields: ${details.requestedFields}`,
        error,
      });
      throw new InternalServerErrorException(errorId);
    }
  }

  /**
   * Format result before sending them to client
   * @param atributes
   * @param param1
   * @returns
   */
  private prepareResult(
    atributes: unknown[],
    { requestedFields }: RequestUsersDTO,
  ): RequestUserSerializer {
    try {
      const requestSerializer = new RequestUserSerializer(requestedFields);
      atributes.forEach((atribute) => {
        requestSerializer[atribute['Name']] = atribute['Value'];
      });
      return requestSerializer;
    } catch (error) {
      if (error instanceof TypeError) throw new ForbiddenException();
      const errorId = uuidv4();
      this.logger.error({
        errorId,
        method: 'prepareResult',
        message: `Error while preparing result`,
        error,
      });
    }
  }
}
