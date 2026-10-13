import { HttpException, Injectable } from '@nestjs/common';
import type { AiChatDto } from './dto/ai-chat.dto.js';
import {
  MAX_BODY_BYTES,
  MAX_QUESTION_CHARS,
  buildMessages,
  sanitizeAnalysis,
  sanitizeHistory,
} from './ai-chat-context.js';
import { BedrockMantleHttpError, BedrockMantleService } from './bedrock-mantle.service.js';

export interface AiChatAnswer {
  answer: string;
  model: string;
}

@Injectable()
export class AiChatService {
  constructor(private readonly bedrockMantle: BedrockMantleService) {}

  async chat(dto: AiChatDto): Promise<AiChatAnswer> {
    const question = String(dto.question ?? '')
      .trim()
      .slice(0, MAX_QUESTION_CHARS);
    if (!question)
      throw new HttpException({ error: 'Escreva uma pergunta sobre a análise.' }, 400);

    if (Buffer.byteLength(JSON.stringify(dto), 'utf8') > MAX_BODY_BYTES)
      throw new HttpException({ error: 'Solicitação muito grande.' }, 413);

    const analysis = sanitizeAnalysis(dto.analysis);
    const history = sanitizeHistory(dto.history);
    const messages = buildMessages(question, analysis, history);

    try {
      const { answer, modelId } = await this.bedrockMantle.complete(messages);
      return { answer: answer.trim(), model: modelId };
    } catch (error) {
      const status =
        error instanceof BedrockMantleHttpError && error.status === 429 ? 429 : 502;
      if (status === 429)
        throw new HttpException(
          { error: 'O modelo está recebendo muitas solicitações. Tente novamente em instantes.' },
          429,
        );
      throw new HttpException(
        { error: 'Não foi possível consultar o modelo agora. Tente novamente.' },
        502,
      );
    }
  }
}
