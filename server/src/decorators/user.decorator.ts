import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts cognito username from access token
 * @returns string
 */
export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();
    return user.username as string;
  },
);
