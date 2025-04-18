import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { GetPostGameCarnageReportParams } from 'bungie-api-ts/destiny2'
import { ServerResponse } from 'bungie-api-ts/common'
import { BehaviorSubject, Observable, Subject, of } from 'rxjs'
import { debounceTime, catchError, delay, retryWhen, take } from 'rxjs/operators'

type BungieAction =
  | 'getGlobalAlerts'
  | 'getDestinyManifest'
  | 'getMembershipDataForCurrentUser'
  | 'getMembershipDataById'
  | 'getProfile'
  | 'getActivityHistory'
  | 'getPostGameCarnageReport'
  | 'getHistoricalStats'
  | 'getCharacter'

interface QueueItem<T = unknown> {
  actionFunction: (config: unknown, params: unknown) => Promise<ServerResponse<T>>
  callback: (response: ServerResponse<T>) => Promise<T> | T
  params?: unknown
}

interface QueueState {
  [key: string]: Subject<any>
}

@Injectable({
  providedIn: 'root',
})
export class BungieQueueService {
  private queue: { [key: string]: Observable<any> } = {}

  queue$ = new BehaviorSubject<Record<BungieAction, QueueItem[]>>({
    getGlobalAlerts: [],
    getDestinyManifest: [],
    getMembershipDataForCurrentUser: [],
    getMembershipDataById: [],
    getProfile: [],
    getActivityHistory: [],
    getPostGameCarnageReport: [],
    getHistoricalStats: [],
    getCharacter: [],
  })

  actionPriority: BungieAction[] = [
    'getGlobalAlerts',
    'getDestinyManifest',
    'getMembershipDataForCurrentUser',
    'getMembershipDataById',
    'getProfile',
    'getActivityHistory',
    'getPostGameCarnageReport',
    'getHistoricalStats',
    'getCharacter',
  ]

  queueCount: Record<BungieAction, QueueCount> = {
    getGlobalAlerts: {
      queued: 0,
      completed: 0,
      errors: 0,
      percentage: 0,
      color: 'primary',
    },
    getDestinyManifest: {
      queued: 0,
      completed: 0,
      errors: 0,
      percentage: 0,
      color: 'primary',
    },
    getMembershipDataForCurrentUser: {
      queued: 0,
      completed: 0,
      errors: 0,
      percentage: 0,
      color: 'primary',
    },
    getMembershipDataById: {
      queued: 0,
      completed: 0,
      errors: 0,
      percentage: 0,
      color: 'primary',
    },
    getProfile: {
      queued: 0,
      completed: 0,
      errors: 0,
      percentage: 0,
      color: 'primary',
    },
    getActivityHistory: {
      queued: 0,
      completed: 0,
      errors: 0,
      percentage: 0,
      color: 'primary',
    },
    getPostGameCarnageReport: {
      queued: 0,
      completed: 0,
      errors: 0,
      percentage: 0,
      color: 'primary',
    },
    getHistoricalStats: {
      queued: 0,
      completed: 0,
      errors: 0,
      percentage: 0,
      color: 'primary',
    },
    getCharacter: {
      queued: 0,
      completed: 0,
      errors: 0,
      percentage: 0,
      color: 'primary',
    },
  }

  constructor(private http: HttpClient) {
    this.queue$.pipe(debounceTime(40)).subscribe((queueDict) => {
      for (const action of this.actionPriority) {
        const queue = queueDict[action]
        if (action === 'getPostGameCarnageReport') {
          queue.sort((a, b) => {
            return (
              parseInt((b.params as GetPostGameCarnageReportParams).activityId, 10) -
              parseInt((a.params as GetPostGameCarnageReportParams).activityId, 10)
            )
          })
        }
        if (queue.length > 0) {
          const item = queue[0]
          this.queueCount[action].queued = queue.length
          this.queueCount[action].percentage = Math.round(
            (this.queueCount[action].completed /
              (this.queueCount[action].completed + this.queueCount[action].queued)) *
              100
          )
          item
            .actionFunction(
              {
                url: 'https://www.bungie.net/Platform',
                method: 'GET',
                params: {},
                body: {},
              },
              item.params
            )
            .then((response) => {
              if (response.ErrorCode === 1) {
                item.callback(response)
                this.queueCount[action].completed++
                this.queueCount[action].percentage = Math.round(
                  (this.queueCount[action].completed /
                    (this.queueCount[action].completed + this.queueCount[action].queued)) *
                  100
                )
                const newQueue = [...queue]
                newQueue.shift()
                this.queue$.next({
                  ...this.queue$.value,
                  [action]: newQueue,
                })
              } else {
                this.queueCount[action].errors++
                const newQueue = [...queue]
                newQueue.shift()
                this.queue$.next({
                  ...this.queue$.value,
                  [action]: newQueue,
                })
              }
            })
            .catch((error) => {
              this.queueCount[action].errors++
              const newQueue = [...queue]
              newQueue.shift()
              this.queue$.next({
                ...this.queue$.value,
                [action]: newQueue,
              })
            })
        }
      }
    })
  }

  addToQueue<T>(key: string, action: () => Promise<T>): Observable<T> {
    if (!this.queue[key]) {
      this.queue[key] = new Observable<T>(subscriber => {
        action()
          .then(response => {
            subscriber.next(response);
            subscriber.complete();
          })
          .catch(error => {
            subscriber.error(error);
          });
      }).pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(3))),
        catchError(error => {
          console.error(`Error in ${key}:`, error);
          return of(null);
        })
      );
    }
    return this.queue[key];
  }

  updateQueue(queueCount: Partial<Record<BungieAction, QueueCount>>): void {
    this.queueCount = {
      ...this.queueCount,
      ...queueCount,
    }
  }

  clearQueue(): void {
    this.queue = {}
  }
}

export interface QueueCount {
  queued: number
  completed: number
  errors: number
  percentage: number
  color: 'primary' | 'accent' | 'warn'
}
