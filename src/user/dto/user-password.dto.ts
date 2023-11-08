import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

/**
 * User password input DTO validation
 */
export class UserPasswordDTO {
  @ApiProperty({ type: () => String })
  @IsNotEmpty()
  readonly password: string;
}
