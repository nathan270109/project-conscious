import { Module } from '@nestjs/common';
import { AiChatController } from './ai-chat.controller.js';
import { AiChatService } from './ai-chat.service.js';
import { BedrockMantleService } from './bedrock-mantle.service.js';
import { AwsCredentialProvider } from './aws-credentials.service.js';

@Module({
  controllers: [AiChatController],
  providers: [AiChatService, BedrockMantleService, AwsCredentialProvider],
})
export class AiModule {}
