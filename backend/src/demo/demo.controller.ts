import { Controller, Get } from '@nestjs/common';
import { DemoService } from './demo.service.js';

@Controller('demo')
export class DemoController {
  constructor(private readonly demo: DemoService) {}

  @Get('analysis')
  getDemoAnalysis() {
    return this.demo.getDemoAnalysis();
  }
}
