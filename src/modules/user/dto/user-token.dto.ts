import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * User token input DTO validation
 */
export class UserTokenDTO {
  @ApiProperty({ type: () => String })
  @IsNotEmpty()
  @IsString()
  readonly token: string;
}
