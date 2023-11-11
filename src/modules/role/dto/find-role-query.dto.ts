import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IRole, IRoleFindInput, RolesEnum } from '../../../models';

/**
 * Find Role Query DTO validation
 */
export class FindRoleQueryDTO implements IRoleFindInput {
  @ApiPropertyOptional({ type: () => String })
  @IsOptional()
  @IsString()
  readonly name: IRole['name'] = RolesEnum.USER;
}
