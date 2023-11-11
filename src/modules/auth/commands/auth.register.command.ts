import { ICommand } from '@nestjs/cqrs';
import { IUserRegistrationInput } from '../../../models';
import { IAppIntegrationConfig } from '../../../common';

export class AuthRegisterCommand implements ICommand {
  static readonly type = '[Auth] Register';

  constructor(
    public readonly input: IUserRegistrationInput &
      Partial<IAppIntegrationConfig>,
  ) {}
}
