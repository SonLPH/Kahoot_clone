import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateGameDTO {
  @ApiProperty({ type: String, description: 'Updated pin' })
  @IsOptional()
  @IsString()
  pin: string;

  @ApiProperty({ type: Array, description: 'Updated player list' })
  @IsOptional()
  @IsArray()
  players: Record<string, any>[];
}
