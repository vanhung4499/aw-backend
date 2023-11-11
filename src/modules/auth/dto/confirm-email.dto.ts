import { IUserCodeInput, IUserEmailInput, IUserTokenInput } from '../../../models';
import { IntersectionType } from '@nestjs/swagger';
import { UserCodeDTO, UserEmailDTO, UserTokenDTO } from '../../user/dto';

/**
 * Email confirmation (By TOKEN) DTO request validation
 */
export class ConfirmEmailByTokenDTO
  extends IntersectionType(UserEmailDTO, UserTokenDTO)
  implements IUserEmailInput, IUserTokenInput {}

/**
 * Email confirmation (By CODE) DTO request validation
 */
export class ConfirmEmailByCodeDTO
  extends IntersectionType(UserEmailDTO, UserCodeDTO)
  implements IUserEmailInput, IUserCodeInput {}
