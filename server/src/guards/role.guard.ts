import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  All,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AllowedRoles as AllowedRolesDecorator,
  DisallowedRoles as DisallowedRolesDecorator,
} from '../decorators/roles.decorator';
@Injectable()
export class CognitoRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const logger = new Logger(CognitoRolesGuard.name);
    try {
      const AllowedRoles = this.reflector.get(
        AllowedRolesDecorator,
        context.getHandler(),
      );

      const DisabledRoles = this.reflector.get(
        DisallowedRolesDecorator,
        context.getHandler(),
      );

      /**
       * Check user roles
       */
      const { user } = context.switchToHttp().getRequest();

      const { groups } = user;
      //Missing groups from token -> deny access
      //Wehn no groups are available returns NoGroupsAvailable (default false)
      if (!groups) {
        return false;
      }

      const FilterAllowRoles = () =>
        AllowedRoles.some((endpointRule) => groups.includes(endpointRule));

      const FilterDisableRoles = () =>
        DisabledRoles.some((endpointRule) => groups.includes(endpointRule));

      //No white and not black list -> Allow all
      //No allowed roles decorator is present, and black list is empty -> Allow all
      if (
        (!AllowedRoles && !DisabledRoles) ||
        (!AllowedRoles && DisabledRoles && DisabledRoles.length === 0)
      )
        return true;

      //Disabel access to input when white list is empty -> Deny all
      if (AllowedRoles && AllowedRoles.length === 0) return false;
      //No allowed roles decorator is present, and black list is not empty -> disable access for black list
      if (!AllowedRoles && DisabledRoles && DisabledRoles.length > 0)
        return !FilterDisableRoles();

      //White list is not empty, black list is not present
      if (
        (!DisabledRoles || DisabledRoles.length === 0) &&
        AllowedRoles &&
        AllowedRoles.length > 0
      )
        return FilterAllowRoles();

      //White list is not empty, black list is not empty
      if (
        AllowedRoles &&
        AllowedRoles.length > 0 &&
        DisabledRoles &&
        DisabledRoles.length > 0
      ) {
        if (FilterDisableRoles()) return false;
        else return FilterAllowRoles();
      }

      return false;
    } catch (error) {
      logger.error({
        guard: CognitoRolesGuard.name,
        error: error.message,
      });
      return false;
    }
  }
}
