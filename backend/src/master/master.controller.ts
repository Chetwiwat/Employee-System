import { Controller, Get, Query } from '@nestjs/common';
import { MasterService } from './master.service.js';

@Controller('master')
export class MasterController {
  constructor(private readonly service: MasterService) {}

  @Get('genders')
  genders() {
    return this.service.findGenders();
  }

  @Get('positions')
  positions() {
    return this.service.findPositions();
  }

  @Get('prefixes')
  prefixes(@Query('genderId') genderId?: string) {
    return this.service.findPrefixes(genderId ? Number(genderId) : undefined);
  }
}
