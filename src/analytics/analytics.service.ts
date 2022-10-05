import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { BadRequestException } from '~/exceptions';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getTopData() {
    const searchParams = new URLSearchParams({
      site_id: this.getDomain(),
      metrics: 'pageviews,visits,visitors',
    });

    try {
      const data = await this.fetcher(`stats/aggregate?${searchParams}`);

      return [
        { id: 'views', value: data.results.pageviews.value },
        { id: 'visits', value: data.results.visits.value },
        { id: 'unique_visitors', value: data.results.visitors.value },
      ];
    } catch (error) {
      return [
        { id: 'views', value: 0 },
        { id: 'visits', value: 0 },
        { id: 'unique_visitors', value: 0 },
      ];
    }
  }

  async browserStats() {
    const searchParams = new URLSearchParams({
      site_id: this.getDomain(),
      property: 'visit:browser',
    });

    try {
      const data = await this.fetcher(`stats/breakdown?${searchParams}`);

      const browsers: string[] = [];
      const values: number[] = [];

      for (let i = 0; i < data.results.length; i++) {
        browsers.push(data.results[i].browser);
        values.push(data.results[i].visitors);
      }

      return { browsers, data: values };
    } catch (error) {
      return { browsers: [], data: [] };
    }
  }

  async topPages() {
    const searchParams = new URLSearchParams({
      site_id: this.getDomain(),
      property: 'event:page',
      metrics: 'visitors,pageviews,bounce_rate',
      period: '6mo',
      limit: '10',
    });

    try {
      const data = await this.fetcher(
        `stats/breakdown?${searchParams.toString()}`,
      );

      return data.results;
    } catch (error) {
      return [];
    }
  }

  async getSources() {
    const searchParams = new URLSearchParams({
      site_id: this.getDomain(),
      property: 'visit:source',
    });

    try {
      const data = await this.fetcher(
        `stats/breakdown?${searchParams.toString()}`,
      );

      const sources: string[] = [];
      const values: number[] = [];

      for (let i = 0; i < data.results.length; i++) {
        sources.push(data.results[i].source);
        values.push(data.results[i].visitors);
      }

      return { sources, data: values };
    } catch (error) {
      return { sources: [], data: [] };
    }
  }

  async getTimeSeries(period?: string) {
    if (period && !['month', '7d', 'day'].includes(period)) {
      throw new BadRequestException('Invalid period');
    }

    const searchParams = new URLSearchParams({
      site_id: this.getDomain(),
      period: !period ? 'month' : period,
      metrics: 'pageviews,visits,visitors',
    });

    const statsData: {
      name: string;
      data: number[];
    }[] = [
      { name: 'Page Views', data: [] },
      { name: 'Visits', data: [] },
      { name: 'Unique Visitors', data: [] },
    ];

    try {
      const data = await this.fetcher(
        `stats/timeseries?${searchParams.toString()}`,
      );

      const labels: string[] = [];

      for (let i = 0; i < data.results.length; i++) {
        labels.push(data.results[i].date);

        statsData[0].data.push(data.results[i].pageviews);
        statsData[1].data.push(data.results[i].visits);
        statsData[2].data.push(data.results[i].visitors);
      }

      return { labels, data: statsData };
    } catch (error) {
      return { labels: [], data: statsData };
    }
  }

  async fetcher(path: string) {
    const apiKey = this.configService.get<string>('PLAUSIBLE_API_KEY');

    const $res = this.httpService.get(`https://plausible.io/api/v1/${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const res = await lastValueFrom($res);

    return res.data;
  }

  getDomain(): string {
    return this.configService
      .get<string>('client.url')
      .replace(/https?:\/\//, '');
  }
}
