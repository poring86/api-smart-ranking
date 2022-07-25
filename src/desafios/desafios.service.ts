import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriasService } from 'src/categorias/categorias.service';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { Desafio } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
    private readonly categoriasService: CategoriasService,
    private readonly jogadoresService: JogadoresService,
  ) {}

  private readonly logger = new Logger(DesafiosService.name);
  async criarDesafio(criarDesafioDto: CriarDesafioDto): Promise<Desafio> {
    const { jogadores, solicitante } = criarDesafioDto;

    // Verificar se todos os jogadores da partida estão cadastrados

    const todosJogadores =
      await this.jogadoresService.consultarTodosJogadores();

    jogadores.forEach((jogador) => {
      const jogadorCadastrado = todosJogadores.find(
        (item) => item._id.toString() === jogador._id,
      );

      if (!jogadorCadastrado) {
        throw new BadRequestException(
          `O jogador com o id ${jogador._id} não está cadastrado`,
        );
      }
    });

    // Verificar se solictante faz parte da partida

    const solicitanteJogador = jogadores.find(
      (jogador) => jogador._id === solicitante,
    );

    if (!solicitanteJogador) {
      throw new BadRequestException(
        `O jogador com o id ${solicitante} não é um dos jogadores da partida`,
      );
    }

    // Verificar se solicitante desafio está cadastrado em uma categoria

    const categoriaDoJogador =
      await this.categoriasService.consultarCategoriaDoJogador(solicitante);

    if (!categoriaDoJogador) {
      throw new BadRequestException(
        `O jogador desafiante com o id ${solicitante} não está na categoria`,
      );
    }

    // Salvar desafio

    const desafioCriado = new this.desafioModel(criarDesafioDto);
    desafioCriado.categoria = categoriaDoJogador.Categoria;
    desafioCriado.dataHoraSolicitacao = new Date();

    this.logger.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`);
    return await desafioCriado.save();
  }
  async consultarTodosDesafios() {
    return await this.desafioModel.find();
  }

  async consultarDesafiosDeUmJogador(idJogador) {
    const jogadorEncontrado =
      this.jogadoresService.consultarJogadorPeloId(idJogador);

    if (!jogadorEncontrado) {
      throw new BadRequestException(
        `O jogador desafiante com o id ${idJogador} não encontrado`,
      );
    }

    return await this.desafioModel
      .find()
      .where('jogadores')
      .in([idJogador])
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida')
      .exec();
  }
}
