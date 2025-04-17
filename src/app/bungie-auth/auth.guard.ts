import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { BungieAuthService } from './bungie-auth.service'
import { map, take } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: BungieAuthService, private router: Router) {}

  canActivate() {
    return this.authService.hasValidAccessToken$.pipe(
      take(1),
      map((hasValidAccessToken) => {
        if (hasValidAccessToken) {
          return true
        }
        this.router.navigate(['/'])
        return false
      })
    )
  }
} 