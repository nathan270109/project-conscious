import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { vi } from 'vitest';
import { AppModule } from './../src/app.module.js';
import { BedrockMantleHttpError, BedrockMantleService } from './../src/ai/bedrock-mantle.service.js';

describe('AI chat route (e2e)', () => {
  let app: INestApplication;

  const bedrockMock = {
    complete: vi.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BedrockMantleService)
      .useValue(bedrockMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validationError: { target: false, value: false },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await app.close();
  });

  it('POST /ai/chat returns the answer and model on success', async () => {
    bedrockMock.complete.mockResolvedValue({ answer: 'Resposta do modelo', modelId: 'modelo' });

    const response = await request(app.getHttpServer())
      .post('/ai/chat')
      .send({
        question: 'Qual o ponto mais crítico da análise?',
        analysis: { projectName: 'Projeto', score: 50, dimensions: [], findings: [] },
        history: [{ role: 'user', content: 'oi' }],
      })
      .expect(200);

    expect(response.body).toEqual({ answer: 'Resposta do modelo', model: 'modelo' });
    const [messages] = bedrockMock.complete.mock.calls[0] as unknown as [
      Array<{ role: string; content: string }>,
    ];
    expect(messages[0].role).toBe('system');
    expect(messages.at(-1)?.content).toContain('Qual o ponto mais crítico da análise?');
  });

  it('POST /ai/chat returns safe 400 for an empty question', async () => {
    await request(app.getHttpServer())
      .post('/ai/chat')
      .send({ question: '   ' })
      .expect(400)
      .expect({ error: 'Escreva uma pergunta sobre a análise.' });

    expect(bedrockMock.complete).not.toHaveBeenCalled();
  });

  it('POST /ai/chat maps Bedrock throttling to 429', async () => {
    bedrockMock.complete.mockRejectedValue(new BedrockMantleHttpError(429));

    const response = await request(app.getHttpServer())
      .post('/ai/chat')
      .send({ question: 'pergunta?' })
      .expect(429);

    expect(response.body).toEqual({
      error: 'O modelo está recebendo muitas solicitações. Tente novamente em instantes.',
    });
  });

  it('POST /ai/chat returns generic 502 without leaking internals', async () => {
    bedrockMock.complete.mockRejectedValue(Object.assign(new Error('falha interna'), { status: 500 }));

    const response = await request(app.getHttpServer())
      .post('/ai/chat')
      .send({ question: 'pergunta?' })
      .expect(502);

    expect(response.body).toEqual({
      error: 'Não foi possível consultar o modelo agora. Tente novamente.',
    });
  });

  it('POST /ai/chat rejects a non-string question through validation', async () => {
    await request(app.getHttpServer())
      .post('/ai/chat')
      .send({ question: 42 })
      .expect(400)
      .expect(({ body }) => {
        expect(JSON.stringify(body)).toContain('A pergunta deve ser um texto.');
      });

    expect(bedrockMock.complete).not.toHaveBeenCalled();
  });});
