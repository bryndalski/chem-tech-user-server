import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { RequestedFields } from '../enums/RequestedFields.enum';

export class RequestUsersDTO {
  @ApiPropertyOptional({
    name: 'requestedFields',
    description:
      'Fields to be returned in response. You need to have roles: "admin" or "system_admin" to access: "phone_number","groups","active"',
    enum: RequestedFields,
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsEnum(RequestedFields, { each: true })
  requestedFields: RequestedFields[];
}
