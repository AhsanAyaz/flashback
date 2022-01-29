import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { UserService } from '../../../services/user.service';
import { User } from '@prisma/client';
import { takeWhile } from 'rxjs';
import { AnalyticsEvents } from '../../../constants/analytics';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'mg-game-modal',
  templateUrl: './game-modal.component.html',
  styleUrls: ['./game-modal.component.scss'],
})
export class GameModalComponent implements OnInit, OnDestroy {
  @Input() showModal = false;
  @Input() gameUrl = '';
  @Input() user: User | null = null;
  @Input() callInProgress = false;
  @Output() closeModal = new EventEmitter();
  @Output() createNewGame = new EventEmitter();
  @Output() joinGame = new EventEmitter<string>();
  isComponentAlive = false;
  constructor(
    private clipboard: Clipboard,
    private userService: UserService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.isComponentAlive = true;
    this.userService.user$
      .pipe(takeWhile(() => this.isComponentAlive))
      .subscribe((user) => {
        this.user = user;
      });
  }

  updateUserName(name: string, $event: any) {
    $event.preventDefault();
    if (!this.user) {
      return;
    }
    if (!name) {
      alert('Please enter a valid name');
      return;
    }
    this.userService
      .updateUser({ ...this.user, displayName: name })
      .subscribe((user) => {
        this.analytics.logEvent(AnalyticsEvents.USER_NAME_UPDATED);
        this.userService.setUser(user);
      });
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }

  get gameId() {
    if (!this.gameUrl) {
      return '';
    }
    const interim = this.gameUrl?.split('/lobby').shift();
    if (!interim) {
      return '';
    }
    return interim.split('/').pop() || '';
  }

  copyGameId() {
    this.clipboard.copy(this.gameId);
    this.analytics.logEvent(AnalyticsEvents.GAME_ID_COPIED, {
      gameId: this.gameId,
    });
    alert('Copied to clipboard');
  }

  joinExistingGame(url: string, $event: any) {
    $event.preventDefault();
    if (!url) {
      alert('Please enter a valid URL');
      return;
    }
    this.analytics.logEvent(AnalyticsEvents.NAVIGATING_TO_GAME, {
      url,
    });
    this.joinGame.emit(url);
  }
}
