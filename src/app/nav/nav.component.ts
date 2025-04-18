import { Component, OnInit } from '@angular/core'
import { BungieAuthService } from '../bungie-auth/bungie-auth.service'
import { Router, RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavComponent implements OnInit {
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
