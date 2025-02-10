import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GameRepository } from 'src/repositories/game.repository';
import { Game, GameDocument, GameState } from 'src/entities/game.entity';
import { UpdateGameDTO } from 'src/dto/game/update-game.dto';
import { CreateGameDTO } from 'src/dto/game/create-game.dto';
import { AddPlayerDTO } from 'src/dto/game/add-player.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from 'src/entities/quiz.entity';
import { PlayerAnswerDTO } from 'src/dto/game/update-player-result.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GameService {
  private timer: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private gameRepository: GameRepository,
    private eventEmitter: EventEmitter2,
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
  ) {}

  async getGameById(id: string): Promise<Game> {
    return this.gameRepository.findOne(id);
  }

  async updateGame(id: string, updateGame: UpdateGameDTO): Promise<Game> {
    return this.gameRepository.update(id, updateGame);
  }

  async deleteGame(id: string): Promise<void> {
    await this.gameRepository.delete(id);
  }

  async createGame(
    createGameDto: CreateGameDTO,
    hostId: string,
  ): Promise<Game> {
    let flag = false;
    let gamePin: string;
    while (!flag) {
      gamePin = await this.generateGamePin();
      const game = await this.gameModel.findOne({ pin: gamePin }).exec();
      if (!game) {
        flag = true;
      }
    }

    const game = await this.gameRepository.create(
      createGameDto,
      hostId,
      gamePin,
    );

    if (!game) {
      throw new BadRequestException('Invalid game data');
    }

    this.eventEmitter.emit('create_game', { game });
    return game;
  }

  async validateGamePin(gamePin: string): Promise<Game> {
    const game = await this.gameModel
      .findOne({ pin: gamePin, state: GameState.WAITING })
      .exec();

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async joinGame(gameId: string, addPlayerDto: AddPlayerDTO): Promise<Game> {
    const game = await this.gameRepository.findOne(gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.state !== GameState.WAITING) {
      throw new ForbiddenException('Game already started');
    }

    if (await this.validatePlayer(gameId, addPlayerDto.playerName)) {
      throw new Error('Player name already exists');
    }
    return this.gameRepository.addPlayer(gameId, addPlayerDto);
  }

  async validatePlayer(gameId: string, playerName: string): Promise<boolean> {
    const game = await this.gameRepository.findOne(gameId);
    return game.players.some((player) => player.playerName === playerName);
  }

  async startGame(gameId: string): Promise<Game> {
    const game = await this.gameRepository.findOne(gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    game.state = GameState.IN_PROGRESS;
    await game.save();

    this.eventEmitter.emit('start_game', {
      gameId: gameId,
    });

    return game;
  }

  async emitNextQuestion(gameId: string): Promise<void> {
    const game = await this.gameRepository.findOne(gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const quiz = await this.quizModel.findById(game.quizId).exec();

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const question = quiz.questionList[game.currentQuestionIndex];

    this.eventEmitter.emit('new_question', {
      id: gameId,
      hostId: game.hostId.toString(),
      questionType: question.questionType,
      currentQuestionIndex: game.currentQuestionIndex,
      question: question.question,
      answerList: question.answerList,
      timeLimit: question.answerTime * 1000,
    });

    if (this.timer.has(gameId)) clearTimeout(this.timer.get(gameId));

    const timer = setTimeout(
      () => this.handleQuestionTimeout(gameId),
      question.answerTime * 1000,
    );
    this.timer.set(gameId, timer);
  }

  async nextQuestion(gameId: string) {
    const game = await this.gameModel
      .findByIdAndUpdate(
        gameId,
        { $inc: { currentQuestionIndex: 1 } },
        { new: true },
      )
      .exec();

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const quiz = await this.quizModel.findById(game.quizId).exec();

    if (game.currentQuestionIndex >= quiz.questionList.length) {
      return this.finishGame(gameId);
    }
    return this.emitNextQuestion(gameId);
  }

  async handleQuestionTimeout(gameId: string) {
    const game = await this.gameRepository.findOne(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const quiz = await this.quizModel.findById(game.quizId).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const currentQuestionIndex = game.currentQuestionIndex;

    let hasUpdated = false;
    game.players.forEach((player) => {
      const alreadyAnswered = player.results.some(
        (r) => r.questionIndex === currentQuestionIndex,
      );

      if (!alreadyAnswered) {
        player.results.push({
          questionIndex: currentQuestionIndex,
          isAnswered: false,
          answer: null,
          time: 0,
        });
        player.currentQuestionIndex++;
        hasUpdated = true;
      }
    });

    if (hasUpdated) {
      await game.save();
    }

    const topPlayers = await this.showTopPlayers(gameId);
    const payload = {
      id: gameId,
      topPlayers: topPlayers,
      hostId: game.hostId.toString(),
    };
    this.eventEmitter.emit('top_players', payload);
  }

  async showTopPlayers(gameId: string): Promise<any> {
    const game = await this.gameRepository.findOne(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const topPlayers = game.players
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return topPlayers;
  }

  async processAnswer(
    gameId: string,
    playerName: string,
    playerAnswer: PlayerAnswerDTO,
  ): Promise<Game> {
    const game = await this.gameModel.findById(gameId).exec();

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const quiz = await this.quizModel.findById(game.quizId).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const player = game.players.find((p) => p.playerName === playerName);
    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const currentQuestion = quiz.questionList[player.currentQuestionIndex];
    if (!currentQuestion) {
      throw new BadRequestException('Invalid question index');
    }

    let points = 0;
    if (await this.checkAnswer(quiz, game, playerAnswer.answer)) {
      points = await this.calculatePoint(
        currentQuestion.answerTime,
        playerAnswer.time,
        currentQuestion.pointType,
      );
    }

    const newResult = {
      questionIndex: player.currentQuestionIndex,
      isAnswered: playerAnswer.isAnswered,
      answer: playerAnswer.answer,
      time: playerAnswer.time,
      points,
    };

    player.results.push(newResult);
    player.score += points;
    player.currentQuestionIndex++;

    return game.save();
  }

  async finishGame(gameId: string) {
    const game = await this.gameRepository.findOne(gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    game.state = GameState.COMPLETED;
    await game.save();

    if (this.timer.has(gameId)) {
      clearTimeout(this.timer.get(gameId));
      this.timer.delete(gameId);
    }

    const topPlayers = game.players
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const payload = {
      id: gameId,
      topPlayers: topPlayers,
      hostId: game.hostId.toString(),
    };

    this.eventEmitter.emit('finish_game', payload);
  }

  async generateGamePin(): Promise<string> {
    return Math.random().toString().substring(2, 7);
  }

  async calculatePoint(
    time: number,
    answerTime: number,
    pointType: string,
  ): Promise<number> {
    const baseScore = 1000;
    switch (pointType) {
      case 'double':
        return Math.round((baseScore / time) * (time - answerTime)) * 2;
      case 'standard':
        return Math.round((baseScore / time) * (time - answerTime));
      default:
        return 0;
    }
  }

  async checkAnswer(quiz: Quiz, game: Game, answer: string): Promise<boolean> {
    // Need to implent in more quiz type
    const answerList = quiz.questionList[game.currentQuestionIndex].answerList;
    if (answerList.some((a) => a.answer === answer && a.isCorrect)) {
      return true;
    } else {
      return false;
    }
  }
}
