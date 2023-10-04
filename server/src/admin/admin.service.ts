import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDTO } from './dto/CreateUser.dto';

@Injectable()
export class AdminService {
  logger: Logger;

  constructor() {
    this.logger = new Logger(AdminService.name);
  }

  createUser(user: CreateUserDTO) {
    try {
    } catch (error) {}
  }
}
