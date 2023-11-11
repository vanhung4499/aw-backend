import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../core/entities';
import { IEmailTemplate } from '../../models';
import { ApiProperty } from '@nestjs/swagger';

@Entity('email_template')
export class EmailTemplate extends BaseEntity implements IEmailTemplate {
  @ApiProperty({ type: () => String })
  @Index()
  @Column()
  name: string;

  @ApiProperty({ type: () => String })
  @Column({ type: 'text', nullable: true })
  mjml: string;

  @ApiProperty({ type: () => String })
  @Column()
  hbs: string;

  title?: string;
}
