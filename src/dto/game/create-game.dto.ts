import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateGameDTO {
  @ApiProperty({ type: String, description: 'Quiz Id' })
  @IsNotEmpty()
  @IsString()
  quizId: string;

  @ApiProperty({ type: Array, description: 'Player List' })
  @IsArray()
  players: Record<string, any>[];
}
