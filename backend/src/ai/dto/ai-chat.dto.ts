import { ArrayMaxSize, IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class AiChatDto {
  @IsString({ message: 'A pergunta deve ser um texto.' })
  question!: string;

  @IsOptional()
  @IsObject({ message: 'A análise deve ser um objeto.' })
  analysis?: unknown;

  @IsOptional()
  @IsArray({ message: 'O histórico deve ser uma lista.' })
  @ArrayMaxSize(50, { message: 'O histórico deve ter no máximo 50 mensagens.' })
  history?: unknown[];
}
