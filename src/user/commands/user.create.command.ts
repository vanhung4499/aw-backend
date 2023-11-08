import { ICommand } from '@nestjs/cqrs';
import { IUserCreateInput } from '../../models';

export class UserCreateCommand implements ICommand {
  static readonly type = '[User] Create';

  constructor(public readonly input: IUserCreateInput) {}
}
