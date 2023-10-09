import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { RequestedFields } from '../enums/RequestedFields.enum';
import { Transform, Type } from 'class-transformer';

export class RequestUsersDTO {
  @ApiProperty({
    name: 'requestedFields',
    description:
      'Fields to be returned in response. You need to have roles: "admin" or "system_admin" to access: "phone_number","groups","active"',
    enum: RequestedFields,
    isArray: true,
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]), {})
  @IsEnum(RequestedFields, { each: true })
  requestedFields: RequestedFields[];

  @ApiProperty({
    name: 'limit',
    description: 'Limit number of returned users',
    type: Number,
  })
  @Min(0)
  @Max(10)
  @IsNumber()
  @Type(() => Number)
  limit: number;

  @ApiPropertyOptional({
    name: 'nextToken',
    description: 'Token to get next page of users',
    type: String,
  })
  @IsString()
  @IsOptional()
  paginationToken?: string;
}
