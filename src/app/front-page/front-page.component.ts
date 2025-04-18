import { Component } from '@angular/core'
import { BungieAuthService } from '../bungie-auth/bungie-auth.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.scss'],
})
export class FrontPageComponent {
  username: string = '';

  constructor(public bungieAuth: BungieAuthService, private router: Router) {}

  async login() {
    await this.bungieAuth.login()
    this.router.navigate(['/activities'])
  }

  searchByUsername() {
    if (this.username.trim()) {
      // TODO: Implement username search
      // For now, just navigate to activities with the username as a query param
      this.router.navigate(['/activities'], {
        queryParams: { username: this.username.trim() }
      });
    }
  }
}
