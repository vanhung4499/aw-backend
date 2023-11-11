import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { IRole, IUser } from '../../models';
import { BaseEntity, Role } from '../core/entities/internal';

@Entity('user')
export class User extends BaseEntity implements IUser {
  @ApiPropertyOptional({ type: () => String, minLength: 3, maxLength: 20 })
  @IsOptional()
  @IsString()
  @Index({ unique: false })
  @Column({ nullable: true })
  username?: string;

  @ApiPropertyOptional({ type: () => String, minLength: 3, maxLength: 100 })
  @IsOptional()
  @IsEmail()
  @Index({ unique: false })
  @Column({ nullable: true })
  email?: string;

  @ApiPropertyOptional({ type: () => String, minLength: 4, maxLength: 12 })
  @IsOptional()
  @IsString()
  @Index()
  @Column({ nullable: true })
  phoneNumber?: string;

  @ApiPropertyOptional({ type: () => String })
  @IsOptional()
  @IsString()
  @Index()
  @Column({ nullable: true })
  firstName?: string;

  @ApiPropertyOptional({ type: () => String })
  @IsOptional()
  @IsString()
  @Index()
  @Column({ nullable: true })
  lastName?: string;

  @ApiPropertyOptional({ type: () => String })
  @IsOptional()
  @IsString()
  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  hash?: string;

  @ApiPropertyOptional({ type: () => String })
  @IsOptional()
  @IsString()
  @Exclude({ toPlainOnly: true })
  @Column({ insert: false, nullable: true })
  public refreshToken?: string;

  @ApiPropertyOptional({ type: () => String, maxLength: 500 })
  @IsOptional()
  @IsString()
  @Column({ length: 500, nullable: true })
  imageUrl?: string;

  @ApiPropertyOptional({ type: () => String })
  @IsOptional()
  @IsString()
  @Exclude({ toPlainOnly: true })
  @Column({ insert: false, nullable: true })
  public code?: string;

  @ApiPropertyOptional({ type: () => Date })
  @IsOptional()
  @Exclude({ toPlainOnly: true })
  @Column({ insert: false, nullable: true })
  public codeExpireAt?: Date;

  @ApiPropertyOptional({ type: () => Date })
  @IsOptional()
  @Exclude({ toPlainOnly: true })
  @Column({ insert: false, nullable: true })
  public emailVerifiedAt?: Date;

  @ApiPropertyOptional({ type: () => String })
  @IsOptional()
  @Exclude({ toPlainOnly: true })
  @Column({ insert: false, nullable: true })
  public emailToken?: string;

  /*
	|--------------------------------------------------------------------------
	| @ManyToOne
	|--------------------------------------------------------------------------
	*/

  /**
   * Role
   */
  @ManyToOne(() => Role, {
    /** Indicates if relation column value can be nullable or not. */
    nullable: true,

    /** Database cascade action on delete. */
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  role?: IRole;
}
