import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { IBaseEntityModel } from '../../models';

export abstract class Model {
  constructor(input?: any) {
    if (input) {
      for (const [key, value] of Object.entries(input)) {
        (this as any)[key] = value;
      }
    }
  }
}
export abstract class BaseEntity extends Model implements IBaseEntityModel {
  @ApiPropertyOptional({ type: () => String })
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  // Date when the record was created
  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    example: '2018-11-21T06:20:32.232Z',
  })
  @CreateDateColumn()
  createdAt?: Date;

  // Date when the record was last updated
  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    example: '2018-11-21T06:20:32.232Z',
  })
  @UpdateDateColumn()
  updatedAt?: Date;

  // Soft Delete
  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    example: '2018-11-21T06:20:32.232Z',
  })
  @IsOptional()
  @IsDateString()
  @DeleteDateColumn()
  deletedAt?: Date;

  // Indicates if record is active now
  @ApiPropertyOptional({ type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  @Index()
  @Column({ nullable: true, default: true })
  isActive?: boolean;
}
