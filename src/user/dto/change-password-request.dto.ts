import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordRequestDto {
  @IsString()
  @ApiProperty({
    description: 'Current password to verify identity',
  })
  currentPassword: string;

  @IsString()
  @ApiProperty({
    description: 'New password',
  })
  newPassword: string;
}
