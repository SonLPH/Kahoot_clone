import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseFilters,
} from '@nestjs/common';
import { AllExceptionsFilter } from '../../filter/exceptions.filter';
import { AuthService } from './auth.service';
import { RegisterDto } from '../../dto/auth/register.dto';
import { Response } from 'express';
import sendResponse from 'src/utils/send-response';
import { LoginDto } from '../../dto/auth/login.dto';

@Controller('auth')
@UseFilters(AllExceptionsFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() response: Response) {
    return sendResponse(
      response,
      HttpStatus.CREATED,
      'Register success.',
      await this.authService.register(registerDto),
      null,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    return sendResponse(
      response,
      HttpStatus.OK,
      'Login success.',
      await this.authService.login(loginDto),
      null,
    );
  }
}
