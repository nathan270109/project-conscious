import { Module } from '@nestjs/common';
import { RisksService } from './risks.service.js';

@Module({
  // Registra o RisksService como um provedor injetável dentro do escopo deste módulo
  providers: [RisksService],
  // Torna o RisksService disponível para ser injetado em outros módulos que importarem o RisksModule
  exports: [RisksService],
})
export class RisksModule {}
