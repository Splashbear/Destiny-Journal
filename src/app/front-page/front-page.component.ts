import { Component } from '@angular/core'
import { BungieAuthService } from '../bungie-auth/bungie-auth.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.scss'],
})
export class FrontPageComponent {
  constructor(public bungieAuth: BungieAuthService, private router: Router) {}

  async login() {
    await this.bungieAuth.login()
    this.router.navigate(['/activities'])
  }
}
