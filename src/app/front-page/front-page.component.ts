import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { Router, RouterModule } from '@angular/router'

@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterModule
  ]
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
