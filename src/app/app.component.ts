import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';
import { BungieStatusComponent } from './bungie-status/bungie-status.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, NavComponent, FooterComponent, BungieStatusComponent]
})
export class AppComponent {
  title = 'destiny-journal';
}
