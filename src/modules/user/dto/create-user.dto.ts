import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { UserEmailDTO } from './user-email.dto';
import { IsOptional } from 'class-validator';

export class CreateUserDTO extends UserEmailDTO {
  @ApiPropertyOptional({ type: () => String })
  @IsOptional()
  @Transform((params: TransformFnParams) =>
    params.value ? params.value.trim() : null,
  )
  readonly firstName?: string;

  @ApiProperty({ type: () => String })
  @ApiPropertyOptional()
  @Transform((params: TransformFnParams) =>
    params.value ? params.value.trim() : null,
  )
  readonly lastName?: string;
}
