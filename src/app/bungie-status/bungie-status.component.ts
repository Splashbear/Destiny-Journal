import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Component, OnInit, OnDestroy } from '@angular/core'
import { ServerResponse } from 'bungie-api-ts/destiny2'
import { BehaviorSubject, Subscription, throwError as observableThrowError } from 'rxjs'
import { catchError } from 'rxjs/operators'

interface BungieAlert {
  type: string
  message: string
  timestamp: string
}

@Component({
  selector: 'app-bungie-status',
  templateUrl: './bungie-status.component.html',
  styleUrls: ['./bungie-status.component.scss'],
})
export class BungieStatusComponent implements OnInit, OnDestroy {
  public bungieSub: Subscription
  public bungieStatus: BehaviorSubject<BungieAlert[]>

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.bungieStatus = new BehaviorSubject<BungieAlert[]>([])
    this.bungieSub = this.http
      .get<ServerResponse<BungieAlert[]>>('https://www.bungie.net/Platform/GlobalAlerts/')
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 200) {
            // Request was successful, but the response was empty or malformed
            console.error('Error parsing response:', error.error)
          } else {
            // Request failed with a non-200 status code
            console.error('Request failed with status code:', error.status)
          }
          return observableThrowError(error.error || 'Server error')
        })
      )
      .subscribe((res: ServerResponse<BungieAlert[]>) => {
        if (res.ErrorCode === 1) {
          // Request was successful, update the bungieStatus
          this.bungieStatus.next(res.Response || [])
        } else {
          // Request failed with a non-success error code
          console.error('Request failed with error code:', res.ErrorCode)
        }
      })
  }

  ngOnDestroy() {
    if (this.bungieSub) {
      this.bungieSub.unsubscribe()
    }
  }
}
