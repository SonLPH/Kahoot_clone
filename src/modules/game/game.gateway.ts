import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { AddPlayerDTO } from 'src/dto/game/add-player.dto';
import { PlayerAnswerDTO } from 'src/dto/game/update-player-result.dto';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway(4000, { cors: true })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  @OnEvent('create_game')
  async handleCreateGame(
    @MessageBody()
    data: {
      game: any;
    },
  ) {
    const hostId = data.game.hostId.toString();
    try {
      this.server.to(hostId).emit('host_waiting_room_updated', data.game);
    } catch (error) {
      console.log(error);
      this.server.to(hostId).emit('create_game_error', error.message);
    }
  }

  @SubscribeMessage('host_join_room')
  async handleHostJoin(
    @MessageBody()
    data: { hostId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      client.join(data.hostId);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @MessageBody()
    data: { gameId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const addPlayerDto: AddPlayerDTO = {
        playerName: data.playerName,
      };
      const game = await this.gameService.joinGame(data.gameId, addPlayerDto);

      client.join(data.gameId);
      this.server
        .to(game.hostId.toString())
        .emit('host_waiting_room_updated', game);
    } catch (error) {
      this.server.to(client.id).emit('join_game_error', error.message);
    }
  }

  @OnEvent('start_game')
  async handleStartGame(@MessageBody() data: { gameId: string }) {
    try {
      await this.gameService.emitNextQuestion(data.gameId);
    } catch (error) {
      this.server.to(data.gameId).emit('start_game_error', error.message);
    }
  }

  @OnEvent('new_question')
  async handleClientNewQuestion(
    @MessageBody()
    data: {
      id: string;
      hostId: string;
      questionType: string;
      currentQuestionIndex: number;
      question: string;
      answerList: any;
      timeLimit: number;
    },
  ) {
    try {
      this.server.to(data.id).emit('player_new_question', data);
      this.server.to(data.hostId).emit('host_new_question', data);
    } catch (error) {
      this.server.to(data.id).emit('new_question_error', error.message);
    }
  }

  @OnEvent('top_players')
  async handleTopPlayers(
    @MessageBody() data: { id: string; hostId: string; topPlayers: any },
    // topPlayers: [{
    //    playerName: string;
    //    score: number;
    //    results: []
    //    currentQuestionIndex: number;
    // }]
  ) {
    console.log(data.topPlayers);
    try {
      this.server.to(data.id).emit('player_leaderboard_top_5', data.topPlayers);
      this.server
        .to(data.hostId)
        .emit('host_leaderboard_top_5', data.topPlayers);
    } catch (error) {
      this.server.to(data.id).emit('top_players_error', error.message);
    }
  }

  @OnEvent('finish_game')
  async handleGameFinished(
    @MessageBody() data: { id: string; hostId: string; topPlayers: any },
    // topPlayers: [{
    //    playerName: string;
    //    score: number;
    //    results: []
    //    currentQuestionIndex: number;
    // }]
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.server.to(data.id).emit('player_game_finished', data.topPlayers);
      this.server.to(data.hostId).emit('host_game_finished', data.topPlayers);
    } catch (error) {
      this.server.to(client.id).emit('game_finished_error', error.message);
    }
  }

  @SubscribeMessage('player_submit_answer')
  async handleSubmitAnswer(
    @MessageBody()
    data: {
      gameId: string;
      playerName: string;
      playerAnswer: PlayerAnswerDTO;
    },
  ) {
    await this.gameService.processAnswer(
      data.gameId,
      data.playerName,
      data.playerAnswer,
    );
  }
}
