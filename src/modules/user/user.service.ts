import { Injectable } from '@nestjs/common';
import { UserDocument } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user.repository';
import { RegisterDto } from '../../dto/auth/register.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(createUserDto: RegisterDto): Promise<UserDocument> {
    return this.userRepository.createUser(createUserDto);
  }

  async getUserById(id: string): Promise<UserDocument> {
    return this.userRepository.findUserById(id);
  }

  async getUsers(): Promise<UserDocument[]> {
    return this.userRepository.getUsers();
  }

  async updateUser(
    id: string,
    updateUserDto: RegisterDto,
  ): Promise<UserDocument> {
    return this.userRepository.updateUser(id, updateUserDto);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.softDeleteUser(id);
  }
}
