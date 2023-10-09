import { ApiProperty } from '@nestjs/swagger';
import { RequestedFields } from '../enums/RequestedFields.enum';

export class RequestUserSerializer {
  @ApiProperty({
    name: 'full name',
    description: "User's full name",
    type: String,
    example: 'John Doe',
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  full_name: string;

  @ApiProperty({
    name: 'email',
    description: "User's email",
    type: [String, null],
    example: 'mail@mail.com',
  })
  email: string;

  @ApiProperty({
    name: 'phone number',
    description: "User's phone number",
    type: String,
    example: '+123456789',
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  phone_number: string;

  @ApiProperty({
    name: 'picture',
    description: "User's profile picture",
    type: String,
    example: 'https://pbs.twimg.com/media/DFem8K0UwAAuVlj.jpg',
  })
  picture: string;

  constructor(requestedFields: RequestedFields[]) {
    requestedFields.forEach((field) => {
      this[field] = this[field];
    });
  }
}
