import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddPlayerDTO } from 'src/dto/game/add-player.dto';
import { CreateGameDTO } from 'src/dto/game/create-game.dto';
import { UpdateGameDTO } from 'src/dto/game/update-game.dto';
import { Game, GameDocument } from 'src/entities/game.entity';

@Injectable()
export class GameRepository {
  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
  ) {}

  async create(
    newGame: CreateGameDTO,
    hostId: string,
    gamePin: string,
  ): Promise<Game> {
    const game = Object.assign(newGame, { hostId: hostId, pin: gamePin });

    const createdGame = new this.gameModel(game);

    return await createdGame.save();
  }

  async findOne(id: string): Promise<Game> {
    const game = await this.gameModel.findById(id).exec();

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async delete(id: string): Promise<void> {
    await this.gameModel.findByIdAndDelete(id, { deletedAt: new Date() });
  }

  async update(id: string, updateGame: UpdateGameDTO): Promise<Game> {
    const updatedGame = await this.gameModel
      .findByIdAndUpdate(id, updateGame, { new: true })
      .exec();

    if (!updatedGame) {
      throw new NotFoundException('Game not found');
    }

    return updatedGame;
  }

  async addPlayer(id: string, addPlayerDto: AddPlayerDTO): Promise<Game> {
    const game = await this.gameModel.findById(id).exec();

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const newPlayer = {
      playerName: addPlayerDto.playerName,
      score: 0,
      results: [],
    };

    game.players.push(newPlayer);
    return game.save();
  }
}
