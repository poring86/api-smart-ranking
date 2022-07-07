import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { Callback } from 'mongoose';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';
import { JogadoresService } from './jogadores.service';

@Controller('api/v1/jogadores')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Post()
  async criarAtualizarJogador(@Body() CriarJogadorDto: CriarJogadorDto) {
    await this.jogadoresService.criarAtualizarJogador(CriarJogadorDto);
  }

  @Get()
  async consultarJogadores(
    @Query('email') email: string,
  ): Promise<Jogador[] | Callback<Jogador>> {
    if (email) {
      return await this.jogadoresService.consultarJogadorPeloEmail(email);
    }
    return await this.jogadoresService.consultarTodosJogadores();
  }

  @Delete()
  async deletarJogador(@Query('email') email: string): Promise<void> {
    this.jogadoresService.deletarJogador(email);
  }
}
