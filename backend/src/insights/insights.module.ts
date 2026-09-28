import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service.js';

@Module({
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
