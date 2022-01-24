import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '@prisma/client';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, of } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  apiUrl = environment.apiUrl;
  userSource: BehaviorSubject<User | null>;
  user$: Observable<User | null>;
  authCheckedSource = new BehaviorSubject<boolean>(false);
  authChecked$: Observable<boolean>;
  userStorageKey = 'flasback-user';
  constructor(private http: HttpClient) {
    this.userSource = new BehaviorSubject<User | null>(
      this.getUserFromStorage()
    );
    this.user$ = this.userSource.asObservable();
    this.authChecked$ = this.authCheckedSource.asObservable();
  }

  getUserFromStorage() {
    const user = localStorage.getItem(this.userStorageKey);
    return user ? JSON.parse(user) : null;
  }

  setUserInStorage(user: User | null) {
    if (!user) {
      localStorage.removeItem(this.userStorageKey);
      return;
    }
    localStorage.setItem(this.userStorageKey, JSON.stringify(user));
  }

  createUserIfNecessary() {
    const userFromStorage = this.getUserFromStorage();
    if (userFromStorage) {
      return of(userFromStorage);
    }
    return this.http.post<User>(`${this.apiUrl}/users`, {});
  }

  updateUser(user: User) {
    const { id, ...update } = user;
    return this.http.patch<User>(`${this.apiUrl}/users/${user.id}`, update);
  }

  setAuthChecked(checked: boolean) {
    this.authCheckedSource.next(checked);
  }

  setUser(user: User | null) {
    this.setUserInStorage(user);
    this.userSource.next(user);
  }

  logout() {
    this.setUser(null);
  }
}
