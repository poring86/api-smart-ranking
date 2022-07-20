import { Injectable } from '@nestjs/common';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { Desafio } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {
  async criarDesafio(criarDesafioDto: CriarDesafioDto): Promise<Desafio> {}
}
