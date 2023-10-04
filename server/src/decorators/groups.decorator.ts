import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts cognito username from access token
 * @returns string
 */
export const Groups = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();
    return (user.groups as string[]) || [];
  },
);
