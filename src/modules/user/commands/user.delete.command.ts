import { ICommand } from '@nestjs/cqrs';
import { IUser } from '../../../models';

export class UserDeleteCommand implements ICommand {
  static readonly type = '[User] Delete Account';

  constructor(public readonly userId: IUser['id']) {}
}
