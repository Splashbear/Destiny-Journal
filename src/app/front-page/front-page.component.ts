import { Component } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.scss'],
})
export class FrontPageComponent {
  username: string = '';

  constructor(private router: Router) {}

  searchByUsername() {
    if (this.username.trim()) {
      this.router.navigate(['/activities'], {
        queryParams: { username: this.username.trim() }
      });
    }
  }
}
