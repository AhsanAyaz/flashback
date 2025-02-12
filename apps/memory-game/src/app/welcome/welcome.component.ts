import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { takeWhile } from 'rxjs/operators';
import { GameService } from '../services/game.service';
import { UserService } from '../services/user.service';
import { User } from '@prisma/client';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { GameState } from '../interfaces/Game.interface';
import { AnalyticsEvents } from '../constants/analytics';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'mg-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  showGameModal = false;
  fbUser!: firebase.User | null;
  user!: User | null;
  componentIsAlive = true;
  gameUrl = '';
  authChecked$ = this.userService.authChecked$;
  callInProgress = false;
  constructor(
    private auth: AngularFireAuth,
    private analytics: AnalyticsService,
    private gameService: GameService,
    private userService: UserService,
    private router: Router,
    private db: AngularFireDatabase
  ) {}

  ngOnInit() {
    this.gameService.setGame(null);
    this.userService.user$
      .pipe(takeWhile(() => this.componentIsAlive))
      .subscribe((user) => {
        this.user = user;
      });
  }

  async letsGo() {
    if (!this.user) {
      try {
        // await this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        this.showGameModal = true;
        this.analytics.logEvent(AnalyticsEvents.OPENED_GAME_MODAL);
      } catch (err) {
        console.error(err);
      }
    } else {
      this.showGameModal = true;
    }
  }

  async logout() {
    await this.auth.signOut();
    this.userService.logout();
  }

  closeModal() {
    this.showGameModal = false;
    this.analytics.logEvent(AnalyticsEvents.CLOSED_GAME_MODAL);
  }

  createNewGame() {
    if (!this.user) {
      return;
    }
    this.callInProgress = true;
    this.gameService.createNewGame(this.user?.id).subscribe(
      (game) => {
        this.gameUrl = `${location.origin}/#/game/${game.url}/lobby`;
        const { url, id, hostId, participantsIds } = game;
        this.db.object(`games/${game.url}`).set({
          ...{ url, id, hostId, participantsIds },
          state: GameState.Waiting,
        });
        this.analytics.logEvent(AnalyticsEvents.GAME_CREATED, {
          gameUrl: this.gameUrl,
          hostId,
        });
        this.callInProgress = false;
      },
      () => {
        this.callInProgress = false;
      }
    );
  }

  joinGame(url: string) {
    this.router.navigate(['/game', url, 'lobby']);
  }
}
