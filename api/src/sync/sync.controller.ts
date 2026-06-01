import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
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
}
