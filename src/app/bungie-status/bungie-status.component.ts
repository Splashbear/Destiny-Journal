import { Component, OnInit } from '@angular/core';
import { ServerResponse } from 'bungie-api-ts/destiny2';
import {
  BehaviorSubject,
  Subscription,
  throwError as observableThrowError
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BungieHttpService } from '../services/bungie-http.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-bungie-status',
  templateUrl: './bungie-status.component.html',
  styleUrls: ['./bungie-status.component.scss']
})
export class BungieStatusComponent implements OnInit {
  public bungieSub: Subscription;
  public bungieStatus: BehaviorSubject<{}[]>;

  constructor(private bHttp: BungieHttpService) {}

  ngOnInit() {
    this.bungieStatus = new BehaviorSubject([]);
    this.bungieSub = this.bHttp
      .get('https://www.bungie.net/Platform/GlobalAlerts/')
      .pipe(
        catchError((error: HttpErrorResponse) =>
          observableThrowError(error.error || 'Server error')
        )
      )
      .subscribe((res: ServerResponse<any>) => {
        try {
          this.bungieStatus.next(res.Response);
        } catch (e) {}
      });
  }
}
