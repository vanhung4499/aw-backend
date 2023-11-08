import { UserEmailDTO } from './user-email.dto';
import { UserPasswordDTO } from './user-password.dto';
import { IntersectionType } from '@nestjs/swagger';
import { IUserEmailInput, IUserPasswordInput } from '../../models';

/**
 * User login DTO validation
 */
export class UserLoginDTO
  extends IntersectionType(UserEmailDTO, UserPasswordDTO)
  implements IUserEmailInput, IUserPasswordInput {}
