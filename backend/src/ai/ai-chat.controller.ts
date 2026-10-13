import { Body, Controller, HttpCode, Header, HttpStatus, Post } from '@nestjs/common';
import { AiChatService, type AiChatAnswer } from './ai-chat.service.js';
import { AiChatDto } from './dto/ai-chat.dto.js';

@Controller('ai')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  chat(@Body() dto: AiChatDto): Promise<AiChatAnswer> {
    return this.aiChatService.chat(dto);
  }
}
