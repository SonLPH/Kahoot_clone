import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { Connection } from 'mongoose';
import { Response } from 'express';
import { CreateGameDTO } from 'src/dto/game/create-game.dto';
import sendResponse from 'src/utils/send-response';
import { UpdateGameDTO } from 'src/dto/game/update-game.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { AllExceptionsFilter } from 'src/filter/exceptions.filter';

@Controller('game')
@UseFilters(AllExceptionsFilter)
export class GameController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private gameService: GameService,
  ) {}

  @Post('/pin')
  async validateGamePin(
    @Body('pin') gamePin: string,
    @Res() response: Response,
  ) {
    return sendResponse(
      response,
      HttpStatus.OK,
      'Game pin validated successfully',
      await this.gameService.validateGamePin(gamePin),
      null,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createGames(
    @Body() createGameDto: CreateGameDTO,
    @Req() request: any,
    @Res() response: Response,
  ) {
    return sendResponse(
      response,
      HttpStatus.CREATED,
      'Game created successfully',
      await this.gameService.createGame(createGameDto, request.user.userId),
      null,
    );
  }

  @Get('/:id')
  async getGameById(@Res() response: Response, @Param('id') id: string) {
    return sendResponse(
      response,
      HttpStatus.OK,
      'Game retrieved successfully',
      await this.gameService.getGameById(id),
      null,
    );
  }

  @Put('/:id')
  async updateGame(
    @Body() updateGameDto: UpdateGameDTO,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    return sendResponse(
      response,
      HttpStatus.OK,
      'Game updated successfully',
      await this.gameService.updateGame(id, updateGameDto),
      null,
    );
  }

  @Delete('/:id')
  async deleteGame(@Res() response: Response, @Param('id') id: string) {
    return sendResponse(
      response,
      HttpStatus.NO_CONTENT,
      'Game deleted successfully',
      await this.gameService.deleteGame(id),
      null,
    );
  }
}
