import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Mouse' })
  @IsString()
  @MinLength(2)
  name: string;
}
