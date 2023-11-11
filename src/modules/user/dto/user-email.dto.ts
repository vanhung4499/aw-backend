import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';


/**
 * User email input DTO validation
 */
export class UserEmailDTO {
  @ApiProperty({ type: () => String })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
