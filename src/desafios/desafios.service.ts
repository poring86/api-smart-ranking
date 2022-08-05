import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriasService } from 'src/categorias/categorias.service';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { DesafioStatus } from './interfaces/desafio-status.enum';
import { Desafio, Partida } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
    @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
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
    desafioCriado.status = DesafioStatus.PENDENTE;

    this.logger.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`);
    return await desafioCriado.save();
  }
  async consultarTodosDesafios() {
    return await this.desafioModel.find();
  }

  async consultarDesafiosDeUmJogador(idJogador) {
    const todosJogadores =
      await this.jogadoresService.consultarTodosJogadores();
    const jogadorEncontrado = todosJogadores.find(
      (jogador) => jogador._id.toString() === idJogador,
    );

    if (!jogadorEncontrado) {
      throw new BadRequestException(
        `O jogador id ${idJogador} não está cadastrado`,
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

  async atualizarDesafio(
    _id,
    AtualizarDesafioDto: AtualizarDesafioDto,
  ): Promise<void> {
    const desafioEncontrado = await this.desafioModel.findById(_id).exec();

    if (!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado`);
    }

    if (AtualizarDesafioDto.status) {
      desafioEncontrado.dataHoraResposta = new Date();
    }

    desafioEncontrado.status = AtualizarDesafioDto.status;
    desafioEncontrado.dataHoraDesafio = AtualizarDesafioDto.dataHoraDesafio;

    await this.desafioModel
      .findOneAndUpdate({ _id }, { $set: desafioEncontrado })
      .exec();
  }

  async deletarDesafio(_id): Promise<void> {
    const desafioEncontrado = await this.desafioModel.findById(_id).exec();

    if (!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado`);
    }

    desafioEncontrado.status = DesafioStatus.CANCELADO;

    await this.desafioModel
      .findOneAndUpdate({ _id }, { $set: desafioEncontrado })
      .exec();
  }

  async atribuirDesafioPartida(
    _id: string,
    atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto,
  ): Promise<void> {
    const desafioEncontrado = await this.desafioModel.findById(_id).exec();

    if (!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado!`);
    }

    const jogadorFilter = desafioEncontrado.jogadores.filter(
      (jogador) => jogador._id == atribuirDesafioPartidaDto.def,
    );

    this.logger.log(`desafioEncontrado: ${desafioEncontrado}`);
    this.logger.log(`jogadorFilter: ${jogadorFilter}`);

    if (jogadorFilter.length == 0) {
      throw new BadRequestException(
        `O jogador vencedor não faz parte do desafio!`,
      );
    }

    const partidaCriada = new this.partidaModel(atribuirDesafioPartidaDto);

    partidaCriada.categoria = desafioEncontrado.categoria;

    partidaCriada.jogadores = desafioEncontrado.jogadores;

    const resultado = await partidaCriada.save();

    desafioEncontrado.status = DesafioStatus.REALIZADO;

    desafioEncontrado.partida = resultado._id;

    try {
      await this.desafioModel
        .findOneAndUpdate({ _id }, { $set: desafioEncontrado })
        .exec();
    } catch (error) {
      await this.partidaModel.deleteOne({ _id: resultado._id }).exec();
      throw new InternalServerErrorException();
    }
  }
}
