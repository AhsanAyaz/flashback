import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    const displayName =
      createUserDto.displayName ||
      `Player ${Math.floor(Math.random() * 10_000)}`;

    const createParams = {
      ...createUserDto,
      displayName,
      photoURL:
        createUserDto.photoURL ||
        `https://avatars.dicebear.com/v2/jdenticon/${displayName.replace(
          ' ',
          ''
        )}.svg`,
    };
    return this.usersService.create(createParams);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({
      id,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput
  ) {
    return this.usersService.update({
      where: { id },
      data: updateUserDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove({ id });
  }
}
