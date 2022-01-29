import { Injectable } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { User } from '@prisma/client';
import { AnalyticsEvents } from '../constants/analytics';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  user!: User | null;
  constructor(
    private fbAnalytics: AngularFireAnalytics,
    private userService: UserService
  ) {
    this.userService.user$.subscribe((user) => {
      if (!user) {
        return;
      }
      this.user = user;
      this.fbAnalytics.setUserId(user.id);
    });
  }

  logEvent(message: AnalyticsEvents, data?: unknown) {
    this.fbAnalytics.logEvent(message, data as [string, never]);
  }
}
