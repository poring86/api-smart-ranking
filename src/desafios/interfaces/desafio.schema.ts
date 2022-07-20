import * as mongoose from 'mongoose';

export const DesafioSchema = new mongoose.Schema(
  {
    dataHoraDesafio: { type: Date },
    status: { type: String },
    dataHoraSolicitacao: { type: Date },
    dataHoraResposta: { type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' },
    categoria: { type: String },
    solicitante: { type: mongoose.Schema.Types.ObjectId, ref: 'Jogador' },
    jogadores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jogador',
      },
    ],
    partida: { type: mongoose.Schema.Types.ObjectId, ref: 'Partida' },
  },
  { timestamps: true, collection: 'desafios' },
);
