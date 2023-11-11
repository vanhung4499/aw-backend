import { forwardRef, Module } from '@nestjs/common';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplateController } from './email-template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './email-template.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from '../user/user.module';
import { EmailTemplateReaderService } from './email-template-reader.service';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    RouterModule.register([
      { path: 'email-template', module: EmailTemplateModule },
    ]),
    forwardRef(() => TypeOrmModule.forFeature([EmailTemplate])),
    forwardRef(() => UserModule),
    CqrsModule,
  ],
  providers: [
    EmailTemplateService,
    EmailTemplateReaderService,
    ...QueryHandlers,
    ...CommandHandlers,
  ],
  controllers: [EmailTemplateController],
  exports: [TypeOrmModule, EmailTemplateService],
})
export class EmailTemplateModule {}
