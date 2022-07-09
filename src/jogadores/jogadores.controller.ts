import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';
import { JogadoresService } from './jogadores.service';
import { JogadoresValidacaoParametrosPipe } from './pipes/jogadores-validacao-parametros-pipe';

@Controller('api/v1/jogadores')
export class JogadoresController {
  constructor(private readonly jogadoresService: JogadoresService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async criarAtualizarJogador(@Body() CriarJogadorDto: CriarJogadorDto) {
    await this.jogadoresService.criarAtualizarJogador(CriarJogadorDto);
  }

  @Get()
  async consultarJogadores(
    @Query('email') email: string,
  ): Promise<Jogador[] | Jogador> {
    if (email) {
      return await this.jogadoresService.consultarJogadorPeloEmail(email);
    }
    return await this.jogadoresService.consultarTodosJogadores();
  }

  @Delete()
  async deletarJogador(
    @Query('email', JogadoresValidacaoParametrosPipe) email: string,
  ): Promise<void> {
    this.jogadoresService.deletarJogador(email);
  }
}
