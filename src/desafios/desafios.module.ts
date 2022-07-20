import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JogadoresModule } from 'src/jogadores/jogadores.module';
import { DesafiosController } from './desafios.controller';
import { DesafioSchema } from './interfaces/desafio.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Desafio', schema: DesafioSchema }]),
    JogadoresModule,
  ],
  controllers: [DesafiosController],
})
export class DesafiosModule {}
