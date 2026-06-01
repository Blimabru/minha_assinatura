import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards, UnauthorizedException } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async pullChanges(
    @GetUser() user: { id: string },
    @Query('last_pulled_at') lastPulledAtStr?: string,
  ) {
    const lastPulledAt = lastPulledAtStr ? Number(lastPulledAtStr) : 0;
    return this.syncService.pullChanges(user.id, lastPulledAt);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async pushChanges(
    @GetUser() user: { id: string },
    @Body('changes') changes: any,
  ) {
    return this.syncService.pushChanges(user.id, changes);
  }

  @Get('ads')
  @HttpCode(HttpStatus.OK)
  async getAds() {
    return this.syncService.getAds();
  }

  @Post('ads')
  @HttpCode(HttpStatus.CREATED)
  async createAd(
    @GetUser() user: { isAdmin: boolean },
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('icon') icon: string,
    @Body('color') color: string,
  ) {
    if (!user.isAdmin) {
      throw new UnauthorizedException('Apenas administradores podem criar anúncios.');
    }
    return this.syncService.createAd(title, description, icon, color);
  }

  @Get('coupons')
  @HttpCode(HttpStatus.OK)
  async getCoupons() {
    return this.syncService.getCoupons();
  }

  @Post('coupons')
  @HttpCode(HttpStatus.CREATED)
  async createCoupon(
    @GetUser() user: { isAdmin: boolean },
    @Body() body: any,
  ) {
    if (!user.isAdmin) {
      throw new UnauthorizedException('Apenas administradores podem criar cupons.');
    }
    return this.syncService.createCoupon(body);
  }
}
