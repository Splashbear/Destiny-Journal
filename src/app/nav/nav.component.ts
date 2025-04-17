import { Component } from '@angular/core'
import { BungieAuthService } from '../bungie-auth/bungie-auth.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  public searchString: string

  constructor(public bungieAuth: BungieAuthService, private router: Router) {}

  ngOnInit() {
    this.searchString = ''
  }

  async login() {
    await this.bungieAuth.login()
    this.router.navigate(['/activities'])
  }

  logout() {
    this.bungieAuth.logout()
    this.router.navigate(['/'])
  }
}
