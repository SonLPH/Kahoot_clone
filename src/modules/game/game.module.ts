import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from 'src/entities/game.entity';
import { GameRepository } from 'src/repositories/game.repository';
import { GameController } from './game.controller';
import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { Quiz, QuizSchema } from 'src/entities/quiz.entity';
import { GameGateway } from './game.gateway';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QuizService } from '../quiz/quiz.service';
import { QuizRepository } from 'src/repositories/quiz.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Quiz.name, schema: QuizSchema },
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [GameController],
  providers: [
    QuizService,
    GameService,
    GameRepository,
    GameGateway,
    QuizRepository,
  ],
  exports: [
    QuizService,
    GameService,
    GameRepository,
    GameGateway,
    QuizRepository,
  ],
})
export class GameModule {}
