import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/CreateUser.dto';
import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';
import { CognitoProperties, Roles } from '@/enums';

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
  async createUser(userToCreate: CreateUserDTO, userGroups: string[]) {
    try {
      //Checking if user can create role
      if (!this.isRoleAllowed(userGroups, userToCreate.userRole)) {
        this.logger.warn(
          `User ${userGroups} tried to create user with role ${userToCreate.userRole}`,
        );
        throw new ForbiddenException(
          `user with roles ${userGroups} is not allowed to create user`,
        );
      }
      this.logger.log(`Create user - permission check passed`);

      //Checking if user exists
      if (await this.checkIfUserExists(userToCreate)) {
        this.logger.warn(
          `User ${userToCreate.email} or ${userToCreate.phoneNumber} already exists`,
        );
        throw new ConflictException('User already exists');
      }

      this.logger.log(`Create user - user does not exist`);

      //Creating user
      const command = new AdminCreateUserCommand({
        Username: userToCreate.email,
        UserAttributes: [
          {
            Name: CognitoProperties.PHONE_NUMBER,
            Value: `${userToCreate.phoneNumber}`,
          },
          {
            Name: CognitoProperties.EMAIL,
            Value: `${userToCreate.email}`,
          },
          {
            Name: CognitoProperties.FULL_NAME,
            Value: `${userToCreate.fullName}`,
          },
          {
            Name: CognitoProperties.PICTURE,
            Value: `https://pbs.twimg.com/media/DFem8K0UwAAuVlj.jpg`,
          },
          // { Name: CognitoProperties.EMAIL_VERIFIED, Value: `True` },
        ],
        UserPoolId: this.configService.get('AWS_COGNITO_USER_POOL_ID'),
      });
      const commandResult = await this.AWS_CLIENT.send(command);
      this.logger.debug(commandResult);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      if (error instanceof ForbiddenException) throw error;
      this.logger.error({
        message: 'Error while creating user',
        error,
        method: 'createUser',
      });
      throw new InternalServerErrorException();
    }
  }

  /**
   * Check if user with matching phone number or email already exists
   * @param param0
   * @returns {Promise<boolean>} user exists - true, user does not exist - false
   */
  private async checkIfUserExists({ email, phoneNumber }: CreateUserDTO) {
    try {
      const input = {
        UserPoolId: this.configService.get('AWS_COGNITO_USER_POOL_ID'), // required
        AttributesToGet: ['email', 'phone_number'],
        Filter: `email = "${email}" OR phone_number = "${phoneNumber}"`,
      };
      const command = new ListUsersCommand(input);
      const result = await this.AWS_CLIENT.send(command);
      this.logger.debug({
        message: 'Result of checking if user exists',
        result,
        method: 'checkIfUserExists',
      });
      return result.Users.length > 0;
    } catch (error) {
      this.logger.error({
        message: 'Error while checking if user exists',
        error,
        method: 'checkIfUserExists',
      });
      throw new InternalServerErrorException();
    }
  }

  /**
   * Checks if user is allowed to create user with given role
   * @param userRoles Roles assigned to user
   * @param creationRoles  Role design to be created
   * @returns
   */
  private isRoleAllowed(userRoles: string[], creationRoles: Roles) {
    if (
      userRoles.includes(Roles.SYSTEM_ADMIN) &&
      creationRoles === Roles.SYSTEM_ADMIN
    )
      return false; // system admin can not create other system admin
    if (userRoles.includes(Roles.ADMIN) && creationRoles === Roles.ADMIN)
      return false; // admin can not create other admin

    if (
      userRoles.includes(Roles.ADMIN) &&
      creationRoles.includes(Roles.SYSTEM_ADMIN)
    )
      return false; // admin can not create system admin

    return true;
  }
}
