import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';

export class PlayerAnswerDTO {
  @ApiProperty({ type: Boolean, description: 'Is Answered' })
  @IsNotEmpty()
  @IsBoolean()
  isAnswered: boolean;

  @ApiProperty({ type: String, description: 'Answer' })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty({ type: Number, description: 'Time' })
  @IsNotEmpty()
  @IsNumber()
  time: number;
}

export class UpdatePlayerResultDTO {
  @ApiProperty({ type: String, description: 'Player Name' })
  @IsNotEmpty()
  @IsString()
  playerName: string;

  @ApiProperty({ type: Object, description: 'Player Result' })
  @IsNotEmpty()
  @IsObject()
  playerAnswer: PlayerAnswerDTO;
}
