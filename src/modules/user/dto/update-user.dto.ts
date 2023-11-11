import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';
import { IUserUpdateInput } from '../../../models';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * Update User DTO validation
 */
export class UpdateUserDTO
  extends PartialType(CreateUserDTO)
  implements IUserUpdateInput
{
  @ApiPropertyOptional({ type: () => Boolean })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
