import { Controller, Post, UseGuards, Get, Body, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Public, ResponseMessage } from '../decorator/customize';
import { LoginUserDto, RegisterDto } from '../users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { User } from '../decorator/customize';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiBody({ type: LoginUserDto })
  @Post('login')
  @ResponseMessage("Login successfully")
  login(
    @Req() req,
    @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user,response);
  }

  @Public()
  @Post('register')
  @ResponseMessage("Register succesfully")
  register(@Body() registerDto: RegisterDto){
    return this.authService.register(registerDto)
  }

  @Get('account')
  @ResponseMessage("Get user information")
  async getProfile(@User() user:IUser) {
    return {user}
  }

  @Public()
  @Get('refresh')
  @ResponseMessage("Get user by refreshToken")
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ){
    const refreshToken = request.cookies['refresh_token']
    return this.authService.processNewToken(refreshToken, response)
  }

  @Post('logout')
  @ResponseMessage('Logout successfully')
  logout(
    @Res({ passthrough: true }) response: Response,
    @User() user :IUser
  )
    {
    return this.authService.logout(response,user)
  }
}