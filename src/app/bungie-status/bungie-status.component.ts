import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { ServerResponse } from 'bungie-api-ts/destiny2'
import { BehaviorSubject, Subscription, throwError as observableThrowError } from 'rxjs'
import { catchError } from 'rxjs/operators'

@Component({
  selector: 'app-bungie-status',
  templateUrl: './bungie-status.component.html',
  styleUrls: ['./bungie-status.component.scss'],
})
export class BungieStatusComponent implements OnInit {
  public bungieSub: Subscription
  public bungieStatus: BehaviorSubject<{}[]>

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.bungieStatus = new BehaviorSubject([])
    this.bungieSub = this.http
      .get('[https://www.bungie.net/Platform/GlobalAlerts/')](https://www.bungie.net/Platform/GlobalAlerts/'))
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
      .subscribe((res: ServerResponse<any>) => {
        if (res.statusCode === 200) {
          // Request was successful, update the bungieStatus
          this.bungieStatus.next(res.Response)
        } else {
          // Request failed with a non-200 status code
          console.error('Request failed with status code:', res.statusCode)
        }
      })
  }
