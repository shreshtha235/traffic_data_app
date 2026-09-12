import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('vehicle')
  async getVehicleDistribution(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('country') country?: string,
    @Query('city') city?: string,
  ) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
    return this.analyticsService.getVehicleDistribution(fromDate, toDate, country, city);
  }

  @Get('summary')
  async getSummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
    return this.analyticsService.getSummary(fromDate, toDate);
  }

  @Get('country')
  async getDistribution(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('country') country?: string,
    @Query('city') city?: string,
  ) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
    return this.analyticsService.getDistribution(fromDate, toDate, country, city);
  }
}
