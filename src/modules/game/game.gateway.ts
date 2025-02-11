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
import { SOCKET_EVENT, SOCKET_EVENT_ERROR } from 'src/constants/socket-event';

@WebSocketGateway(4000, { cors: true })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage(SOCKET_EVENT.HOST_JOIN_ROOM)
  async handleHostJoinRoom(
    @MessageBody()
    data: { gameId: string },
    @ConnectedSocket()
    client: Socket,
  ) {
    try {
      client.join(data.gameId);
    } catch (error) {
      this.server
        .to(client.id)
        .emit(SOCKET_EVENT_ERROR.HOST_JOIN_ROOM_ERROR, error.message);
    }
  }

  @SubscribeMessage(SOCKET_EVENT.PLAYER_JOIN_ROOM)
  async handlePlayerJoinRoom(
    @MessageBody()
    data: { gameId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const addPlayerDTO: AddPlayerDTO = {
        playerName: data.playerName,
      };
      const game = await this.gameService.joinGame(data.gameId, addPlayerDTO);
      client.join(data.gameId);
      this.server.to(data.gameId).emit(SOCKET_EVENT.PLAYER_JOINED_ROOM, game);
    } catch (error) {
      this.server
        .to(client.id)
        .emit(SOCKET_EVENT_ERROR.PLAYER_JOIN_ROOM_ERROR, error.message);
    }
  }

  // This event is used for update game status to in-progress
  @SubscribeMessage(SOCKET_EVENT.START_GAME)
  async handleStartGame(@MessageBody() data: { gameId: string }) {
    try {
      await this.gameService.startGame(data.gameId);
    } catch (error) {
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT_ERROR.HOST_START_GAME_ERROR, error.message);
    }
  }

  // This event is used for the host to send the question to all players
  @SubscribeMessage(SOCKET_EVENT.NEW_QUESTION)
  async handleNewQuestion(@MessageBody() data: { gameId: string }) {
    try {
      const game = await this.gameService.getGameById(data.gameId);

      const question = await this.gameService.nextQuestion(data.gameId);
      if (!question) {
        this.server
          .to(data.gameId)
          .emit(SOCKET_EVENT.HOST_FINISH_GAME, { gameId: data.gameId });
        return;
      }

      const payload = {
        id: data.gameId,
        questionType: question.questionType,
        currentQuestionIndex: game.currentQuestionIndex,
        question: question.question,
        answerList: question.answerList,
        timeLimit: question.answerTime * 1000,
        timeStarted: Date.now(),
      };

      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT.PLAYER_GET_QUESTION, payload);
      this.server.to(data.gameId).emit(SOCKET_EVENT.HOST_GET_QUESTION, payload);
      let countDown = question.answerTime;

      if (this.intervals.has(data.gameId)) {
        clearInterval(this.intervals.get(data.gameId));
        this.intervals.delete(data.gameId);
      }

      if (!this.intervals.has(data.gameId)) {
        const interval = setInterval(async () => {
          countDown--;
          this.server
            .to(data.gameId)
            .emit(SOCKET_EVENT.TIMER_UDPATE, { timeLeft: countDown });

          if (countDown <= 0) {
            this.handleQuestionTimeUp(data.gameId);
          }
        }, 1000);
        this.intervals.set(data.gameId, interval);
      }
    } catch (error) {
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT_ERROR.NEW_QUESTION_ERROR, error.message);
    }
  }

  // This function will use to broadcast client that question end up.
  // When get data from this event, client can emit data to some event like get_leaderboard or get_player_result
  private async handleQuestionTimeUp(gameId: string) {
    if (this.intervals.has(gameId)) {
      clearInterval(this.intervals.get(gameId));
      this.intervals.delete(gameId);
    }
    try {
      this.server
        .to(gameId)
        .emit(SOCKET_EVENT.QUESTION_TIME_UP, { gameId: gameId });
    } catch (error) {
      this.server
        .to(gameId)
        .emit(SOCKET_EVENT_ERROR.QUESTION_TIME_UP_ERROR, error.message);
    }
  }

  // This event is used for the host to end the question early
  @SubscribeMessage(SOCKET_EVENT.END_QUESTION_EARLY)
  async handleEndQuestionEarly(@MessageBody() data: { gameId: string }) {
    this.handleQuestionTimeUp(data.gameId);
  }

  // This event is used for the host to get player answers
  @SubscribeMessage(SOCKET_EVENT.PLAYER_SUBMIT_ANSWER)
  async handleSubmitAnswer(
    @MessageBody()
    data: {
      gameId: string;
      playerName: string;
      playerAnswer: PlayerAnswerDTO;
    },
  ) {
    try {
      await this.gameService.processAnswer(
        data.gameId,
        data.playerName,
        data.playerAnswer,
      );
    } catch (error) {
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT_ERROR.PLAYER_SUBMIT_ANSWER_ERROR, error.message);
    }
  }

  // This event is used for the client to get current leaderboard
  @SubscribeMessage(SOCKET_EVENT.GET_LEADERBOARD)
  async handleGetLeaderboard(@MessageBody() data: { gameId: string }) {
    try {
      const leaderboard = await this.gameService.handleQuestionTimeout(
        data.gameId,
      );
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT.HOST_CURRENT_LEADERBOARD, leaderboard);
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT.PLAYER_CURRENT_LEADERBOARD, leaderboard);
    } catch (error) {
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT_ERROR.GET_LEADERBOARD_ERROR, error.message);
    }
  }

  // This event is used for the client to get player's result
  @SubscribeMessage(SOCKET_EVENT.GET_PLAYER_RESULT)
  async handleGetPlayerResult(
    @MessageBody()
    data: {
      gameId: string;
      playerName: string;
    },
  ) {
    try {
      const playerResult = await this.gameService.getPlayerResults(
        data.gameId,
        data.playerName,
      );
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT.PLAYER_RESULT, playerResult);
    } catch (error) {
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT_ERROR.GET_PLAYER_RESULT_ERROR, error.message);
    }
  }

  // This event is used for the host to finish the game and show final leaderboard
  @SubscribeMessage(SOCKET_EVENT.FINISH_GAME)
  async handleHostFinishGame(@MessageBody() data: { gameId: string }) {
    try {
      const leaderboard = await this.gameService.finishGame(data.gameId);
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT.HOST_FINAL_LEADERBOARD, leaderboard);
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT.PLAYER_FINAL_LEADERBOARD, leaderboard);
    } catch (error) {
      this.server
        .to(data.gameId)
        .emit(SOCKET_EVENT_ERROR.FINISH_GAME_ERROR, error.message);
    }
  }
}
