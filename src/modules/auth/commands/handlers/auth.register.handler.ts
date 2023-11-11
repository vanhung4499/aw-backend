import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUser } from '../../../../models';
import { AuthRegisterCommand } from '../auth.register.command';
import { AuthService } from '../../auth.service';
import { UserService } from '../../../user/user.service';

@CommandHandler(AuthRegisterCommand)
export class AuthRegisterHandler
  implements ICommandHandler<AuthRegisterCommand>
{
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  public async execute(command: AuthRegisterCommand): Promise<IUser> {
    const { input } = command;
    return await this.authService.register(input);
  }
}
