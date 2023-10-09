import { ApiProperty } from '@nestjs/swagger';

export class PostPicrureResponse {
  @ApiProperty({
    description: 'Picture Key. Use it to get picture from server',
    example: '0ba65d6e-4715-44e0-86ad-33b056d3c81b',
  })
  pictureKey: string;
}
