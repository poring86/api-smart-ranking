import { Module } from '@nestjs/common';
import { JogadoresModule } from './jogadores/jogadores.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriasModule } from './categorias/categorias.module';
import { DesafiosModule } from './desafios/desafios.module';
import { PartidasModule } from './partidas/partidas.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://localhost:27017/smartranking?directConnection=true',
      {
        useUnifiedTopology: true,
      },
    ),
    JogadoresModule,
    CategoriasModule,
    DesafiosModule,
    PartidasModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
