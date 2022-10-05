import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '~/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '~/auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Get('top-data')
  async getTopData() {
    return this.analyticsService.getTopData();
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Get('browser-stats')
  async browserStats() {
    return this.analyticsService.browserStats();
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Get('top-pages')
  async topPages() {
    return this.analyticsService.topPages();
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Get('sources')
  async topReferrers() {
    return this.analyticsService.getSources();
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Get('time-series')
  async topCountries(@Query('period') period?: string) {
    return this.analyticsService.getTimeSeries(period);
  }
}
