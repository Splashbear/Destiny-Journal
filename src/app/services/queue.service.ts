import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { GetPostGameCarnageReportParams } from 'bungie-api-ts/destiny2'
import { ServerResponse } from 'bungie-api-ts/common'
import { BehaviorSubject, Observable } from 'rxjs'
import { debounceTime, take } from 'rxjs/operators'

interface QueueItem<T = any> {
  actionFunction: (config: any, params: any) => Promise<ServerResponse<T>>
  callback: (response: ServerResponse<T>) => void
  params?: any
}

@Injectable({
  providedIn: 'root',
})
export class BungieQueueService {
  queue$ = new BehaviorSubject<{
    [action: string]: QueueItem[]
  }>({
    getGlobalAlerts: [],
    getDestinyManifest: [],
    getMembershipDataForCurrentUser: [],
    getMembershipDataById: [],
    getProfile: [],
    getActivityHistory: [],
    getPostGameCarnageReport: [],
  })

  actionPriority = [
    'getGlobalAlerts',
    'getDestinyManifest',
    'getMembershipDataForCurrentUser',
    'getMembershipDataById',
    'getProfile',
    'getActivityHistory',
    'getPostGameCarnageReport',
  ]

  queueCount: {
    [queue: string]: QueueCount
  } = {
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

  addToQueue<T>(
    action: string,
    actionFunction: (config: any, params: any) => Promise<ServerResponse<T>>,
    callback: (response: ServerResponse<T>) => void,
    params?: any
  ): Observable<ServerResponse<T>> {
    const queue = this.queue$.value[action]
    if (!queue) {
      throw new Error(`Unknown action: ${action}`)
    }
    const newQueue = [...queue, { actionFunction, callback, params }]
    this.queue$.next({
      ...this.queue$.value,
      [action]: newQueue,
    })
    return new Observable<ServerResponse<T>>((subscriber) => {
      const item = newQueue[newQueue.length - 1]
      const originalCallback = item.callback
      item.callback = (response) => {
        originalCallback(response)
        subscriber.next(response)
        subscriber.complete()
      }
    })
  }

  updateQueue(queueCount: Partial<Record<string, QueueCount>>): void {
    this.queueCount = {
      ...this.queueCount,
      ...queueCount,
    }
  }
}

export interface QueueCount {
  queued: number
  completed: number
  errors: number
  percentage: number
  color: 'primary' | 'accent' | 'warn'
}
