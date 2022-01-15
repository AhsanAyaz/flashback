import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGame } from '../../interfaces/Game.interface';
import { GameService } from '../../services/game.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { takeWhile } from 'rxjs';

@Component({
  selector: 'mg-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss'],
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  score: Record<
    string,
    {
      value: number;
      isWinner: boolean;
    }
  > = {};
  game!: IGame;
  isComponentAlive = true;
  maxScore = 0;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameService: GameService,
    private db: AngularFireDatabase
  ) {}

  ngOnInit(): void {
    this.isComponentAlive = true;
    const url = this.route.snapshot.paramMap.get('url');
    if (!url) {
      this.router.navigate(['/welcome']);
      return;
    }
    this.getGame(url, () => this.listenToScoreChanges());
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }

  listenToScoreChanges() {
    this.db
      .list<{
        score: number;
        gameUrl: string;
        userId: string;
      }>(`games/${this.game.url}/Score`)
      .valueChanges()
      .pipe(takeWhile(() => this.isComponentAlive))
      .subscribe(() => {
        this.getGame(this.game.url);
      });
  }

  getGame(url: string, callback?: () => void) {
    this.gameService.getGame(url).subscribe((game) => {
      this.game = game;
      this.gameService.setGame(game);
      if (callback) {
        callback();
      }
      game.participants.map((participant) => {
        const score = game.Score.find(
          (score) => score.userId === participant.id
        );
        const participantScore = score?.score || 0;
        this.score[participant.id] = {
          value: participantScore,
          isWinner: false,
        };
        if (participantScore > this.maxScore) {
          this.maxScore = participantScore;
        }
      });
      game.participants.map((participant) => {
        if (this.score[participant.id].value === this.maxScore) {
          this.score[participant.id].isWinner = true;
        }
      });
    });
  }
}
