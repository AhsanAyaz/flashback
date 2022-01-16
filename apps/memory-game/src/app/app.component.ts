import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
@Component({
  selector: 'mg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  returnUrl!: string;
  infoOpen = false;
  constructor(
    private auth: AngularFireAuth,
    private router: Router,
    private userService: UserService
  ) {
    this.auth.authState.subscribe((authUser) => {
      this.userService.setAuthChecked(true);
      if (!authUser) {
        let queryParams = {};
        if (!this.router.url.includes('welcome') && this.router.url !== '/') {
          this.returnUrl = this.router.url;
          alert(this.router.url);
          queryParams = { returnUrl: this.router.url };
        }

        this.router.navigate(['/welcome'], {
          queryParams,
        });
      } else {
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
          this.returnUrl = '';
        }
        this.userService.createUserIfNecessary(authUser).subscribe((user) => {
          this.userService.setUser(user);
        });
      }
    });
  }

  toggleInfo() {
    this.infoOpen = !this.infoOpen;
  }
}
