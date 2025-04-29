import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  InternalServerErrorException,
  Param,
  Patch,
} from '@nestjs/common';

import { Auth } from './entities/auth.entity';

import { AuthService } from './auth.service';

import { AuthDecorator } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';

import { LoginAuthDto } from './dto/login-auth.dto';
import { CreateAuthDto, UpdateAuthDto } from './dto';

import { SecurityRoles } from 'src/enums';
import { FindAllUsersDto } from './dto/find-all-users.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @AuthDecorator(SecurityRoles.SUPER_ADMIN, SecurityRoles.ADMIN)
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('sign-in')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Get('renew')
  @AuthDecorator()
  revalidateToken(
    @GetUser() user: Auth, // decorator
  ) {
    return this.authService.revalidateToken(user);
  }

  @Get('logout')
  @AuthDecorator()
  logout(
    @GetUser() user: Auth, // decorator
  ) {
    return user
      ? { ok: true }
      : new InternalServerErrorException(
          'No se puede cerrar sesión si no estas logeado, revisar --logs-- Admin',
        );
  }

  @Get('all-sellers')
  @AuthDecorator()
  findSellers() {
    return this.authService.findSellers();
  }

  @Get()
  @AuthDecorator(SecurityRoles.ADMIN, SecurityRoles.SUPER_ADMIN)
  findAll(@Query() findAllUsersDto: FindAllUsersDto) {
    return this.authService.findAll(findAllUsersDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }
}
