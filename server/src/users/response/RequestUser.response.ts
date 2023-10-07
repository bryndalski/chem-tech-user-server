import { ApiProperty } from '@nestjs/swagger';
import { RequestUserSerializer } from '../serializers/RequestUsers.serializer';

export class RequestUserResponse {
  @ApiProperty({
    name: 'paginationToken',
    description: 'Token to get next page of users',
    type: String,
  })
  paginationToken: string;

  @ApiProperty({
    name: 'users',
    description: 'Users',
    type: () => RequestUserSerializer,
    isArray: true,
  })
  users: RequestUserSerializer[];
}
