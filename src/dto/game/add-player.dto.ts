import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddPlayerDTO {
  @ApiProperty({ type: String, description: 'Player name' })
  @IsNotEmpty()
  @IsString()
  playerName: string;
}
