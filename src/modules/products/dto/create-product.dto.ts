import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Logitech Mouse M90' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiPropertyOptional({ example: 'Wired USB mouse' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 599, description: 'Price in cents' })
  @IsInt()
  @Min(0)
  priceCents: number;

  @ApiProperty({ example: 'M90-001' })
  @IsString()
  @MinLength(2)
  sku: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/mouse.png' })
  @IsOptional()
  @IsString()
  // If you want strict url validation, uncomment below and keep valid urls only:
  // @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: 'cm123...', description: 'Category ID' })
  @IsString()
  categoryId: string;
}
