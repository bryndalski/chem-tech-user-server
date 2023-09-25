import { Reflector } from '@nestjs/core';

export const AllowedRoles = Reflector.createDecorator<string[]>();
export const DisallowedRoles = Reflector.createDecorator<string[]>();
