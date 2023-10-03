import { Roles } from '@/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  Max,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({
    type: String,
    description: 'Full Name of user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @MinLength(3)
  @Max(100)
  fullName: string;

  @ApiProperty({
    description: 'Email of user',
    example: 'johndoe@mail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: () => Roles,
    description: 'Role of user',
    example: Roles.ADMIN,
  })
  @IsEnum(Roles)
  @IsNotEmpty()
  userRole: Roles;

  @ApiProperty({
    description: 'User phone number',
    example: '+481234567890',
  })
  @IsPhoneNumber('PL')
  @IsNotEmpty()
  phoneNumber: string;
}
