import { Roles } from '@/enums';
import { Reflector } from '@nestjs/core';

export const AllowedRoles = Reflector.createDecorator<Roles[]>();
export const DisallowedRoles = Reflector.createDecorator<string[]>();
