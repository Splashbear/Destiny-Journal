import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-platform-icon',
  template: `
    <mat-icon [class.large]="large" [ngClass]="platformClass">
      {{ getPlatformIcon() }}
    </mat-icon>
  `,
  styles: [`
    mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      &.large {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
      &.psn {
        color: #003791;
      }
      &.xbox {
        color: #107C10;
      }
      &.steam {
        color: #171A21;
      }
      &.stadia {
        color: #CD2640;
      }
      &.epic {
        color: #2F2D2E;
      }
    }
  `],
  standalone: true,
  imports: [MatIconModule, NgClass]
})
export class PlatformIconComponent {
  @Input() membershipType?: number;
  @Input() large = false;

  getPlatformIcon(): string {
    switch (this.membershipType) {
      case 1: // Xbox
        return 'sports_esports';
      case 2: // PSN
        return 'sports_esports';
      case 3: // Steam
        return 'computer';
      case 4: // Battle.net
        return 'computer';
      case 5: // Stadia
        return 'sports_esports';
      case 6: // Epic
        return 'computer';
      default:
        return 'device_unknown';
    }
  }

  get platformClass(): string {
    switch (this.membershipType) {
      case 1:
        return 'xbox';
      case 2:
        return 'psn';
      case 3:
        return 'steam';
      case 5:
        return 'stadia';
      case 6:
        return 'epic';
      default:
        return '';
    }
  }
} 