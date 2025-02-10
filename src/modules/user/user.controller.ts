import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { Connection } from 'mongoose';
import sendResponse from 'src/utils/send-response';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private userService: UserService,
  ) {}

  @Get()
  async getUsers(@Res() response: Response) {
    return sendResponse(
      response,
      HttpStatus.OK,
      'Users retrieved successfully',
      await this.userService.getUsers(),
      null,
    );
  }

  @Get('/:id')
  async getUserById(@Res() response: Response, @Param('id') id: string) {
    return sendResponse(
      response,
      HttpStatus.OK,
      'User retrieved successfully',
      await this.userService.getUserById(id),
      null,
    );
  }

  //   @Post('/:id')
  //   async updateUser(
  //     @Body() updateUserDto: RegisterDto,
  //     @Param('id') id: string,
  //     @Res() response: Response,
  //   ) {
  //     return sendResponse(
  //       response,
  //       HttpStatus.OK,
  //       'User updated successfully',
  //       await this.userService.updateUser(id, updateUserDto),
  //       null,
  //     );
  //   }

  @Delete('/:id')
  async deleteUser(@Res() response: Response, @Param('id') id: string) {
    await this.userService.deleteUser(id);
    return response.status(HttpStatus.NO_CONTENT).json({
      message: 'User deleted successfully',
    });
  }
}
