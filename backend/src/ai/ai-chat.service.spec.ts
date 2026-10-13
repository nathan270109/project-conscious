import { describe, expect, it, vi } from 'vitest';
import { HttpException } from '@nestjs/common';
import { AiChatService, type AiChatAnswer } from './ai-chat.service.js';
import { BedrockMantleHttpError } from './bedrock-mantle.service.js';
import { CONSCIOUS_SYSTEM_PROMPT } from './ai-chat-context.js';

const dto = (question: unknown, analysis: unknown = {}, history: unknown = []) => ({
  question,
  analysis,
  history,
});

async function failOf(promise: Promise<AiChatAnswer>): Promise<HttpException> {
  try {
    await promise;
  } catch (error) {
    return error as HttpException;
  }
  throw new Error('A chamada deveria ter falhado e lançado HttpException.');
}

describe('AiChatService.chat', () => {
  it('rejeita pergunta vazia com 400 e mensagem segura', async () => {
    const service = new AiChatService({ complete: vi.fn() } as never);
    for (const invalid of ['', '   ', undefined]) {
      const error = await failOf(service.chat(dto(invalid)));
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(400);
      expect(error.getResponse()).toEqual({ error: 'Escreva uma pergunta sobre a análise.' });
    }
  });

  it('rejeita corpo acima de 128 kB com 413', async () => {
    const bedrock = { complete: vi.fn() };
    const service = new AiChatService(bedrock as never);
    const error = await failOf(service.chat(dto('pergunta', { projectName: 'x'.repeat(130_000) })));
    expect(error.getStatus()).toBe(413);
    expect((error.getResponse() as { error: string }).error).toBe('Solicitação muito grande.');
    expect(bedrock.complete).not.toHaveBeenCalled();
  });

  it('trunca a pergunta, sanitiza o contexto e mantém só as seis últimas mensagens', async () => {
    const bedrock = { complete: vi.fn().mockResolvedValue({ answer: 'pronto', modelId: 'm' }) };
    const service = new AiChatService(bedrock as never);
    await service.chat(
      dto(
        `${'p'.repeat(1200)}\n\n   `,
        { projectName: 'proj', score: 55, dimensions: [{ name: 'Testes', score: 70 }] },
        Array.from({ length: 9 }, (_unused, index) => ({ role: 'user', content: `m${index}` })),
      ),
    );

    const [messages] = bedrock.complete.mock.calls[0] as [Array<{ role: string; content: string }>];
    expect(messages[0].content).toBe(CONSCIOUS_SYSTEM_PROMPT);
    expect(messages).toHaveLength(8);
    expect(messages.at(-1)?.role).toBe('user');
    expect(messages.at(-1)?.content).toContain(`PERGUNTA:\n${'p'.repeat(1000)}`);
  });

  it('devolve `answer` e `model` normalizados em sucesso', async () => {
    const service = new AiChatService({
      complete: vi.fn().mockResolvedValue({ answer: '  ok  ', modelId: 'modelo-x' }),
    } as never);
    await expect(service.chat(dto('pergunta'))).resolves.toEqual({
      answer: 'ok',
      model: 'modelo-x',
    });
  });

  it('mapeia limitação do modelo (HTTP 429) para 429 com mensagem PT-BR', async () => {
    const service = new AiChatService({
      complete: vi.fn().mockRejectedValue(new BedrockMantleHttpError(429)),
    } as never);
    const error = await failOf(service.chat(dto('pergunta')));
    expect(error.getStatus()).toBe(429);
    expect(error.getResponse()).toEqual({
      error: 'O modelo está recebendo muitas solicitações. Tente novamente em instantes.',
    });
  });

  it('mapeia falhas genéricas para 502 sem expor detalhes internos', async () => {
    for (const rejection of [
      new BedrockMantleHttpError(500),
      new BedrockMantleHttpError(401),
      new Error('boom interno'),
    ]) {
      const service = new AiChatService({ complete: vi.fn().mockRejectedValue(rejection) } as never);
      const error = await failOf(service.chat(dto('pergunta')));
      expect(error.getStatus()).toBe(502);
      expect(error.getResponse()).toEqual({
        error: 'Não foi possível consultar o modelo agora. Tente novamente.',
      });
    }
  });
});
