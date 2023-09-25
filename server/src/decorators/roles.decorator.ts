import { Reflector } from '@nestjs/core';
import e from 'express';

export const AllowedRoles = Reflector.createDecorator<string[]>();
export const DisallowedRoles = Reflector.createDecorator<string[]>();
