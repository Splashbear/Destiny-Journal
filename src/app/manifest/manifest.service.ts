import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import {
  DestinyActivityDefinition,
  DestinyActivityModeDefinition,
  DestinyManifest,
  getDestinyManifest,
  ServerResponse
} from 'bungie-api-ts/destiny2'
import { BungieMembershipType, DestinyActivityModeType } from 'quria'
import { del, set } from 'idb-keyval'
import { BehaviorSubject, from, Subject, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { openDB, IDBPDatabase } from 'idb'
import { BungieQueueService } from '../services/queue.service'

interface ManifestDatabase {
  Activity: { [key: string]: DestinyActivityDefinition }
  ActivityMode: { [key: string]: DestinyActivityModeDefinition }
}

interface ManifestDefinitions {
  Activity?: {
    dbTable: Record<string, DestinyActivityDefinition>
    get(hash: number): DestinyActivityDefinition | undefined
  }
  ActivityMode?: {
    dbTable: Record<string, DestinyActivityModeDefinition>
    get(modeType: DestinyActivityModeType): DestinyActivityModeDefinition | undefined
  }
}

@Injectable({
  providedIn: 'root',
})
export class ManifestService {
  alwaysLoadRemote = false

  version: string | null = null
  state: ManifestServiceState = {
    loaded: false,
  }
  state$ = new BehaviorSubject<ManifestServiceState>(this.state)
  /** A signal for when we've loaded a new remote manifest. */
  newManifest$ = new Subject<void>()
  defs: ManifestDefinitions = {}

  private readonly localStorageKey = 'd2-manifest-version'
  private readonly idbKey = 'd2-manifest'
  private db: IDBPDatabase<ManifestDatabase> | null = null
  private manifestVersion$ = new BehaviorSubject<string | null>(null)

  constructor(private http: HttpClient, private bungieQueue: BungieQueueService) {
    this.initializeDatabase()
  }

  private async initializeDatabase(): Promise<void> {
    try {
      this.db = await openDB<ManifestDatabase>('destiny-manifest', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('Activity')) {
            db.createObjectStore('Activity')
          }
          if (!db.objectStoreNames.contains('ActivityMode')) {
            db.createObjectStore('ActivityMode')
          }
        },
      })

      const storedVersion = localStorage.getItem(this.localStorageKey)
      if (storedVersion) {
        this.manifestVersion$.next(storedVersion)
      }

      await this.checkManifestVersion()
    } catch (error) {
      console.error('Failed to initialize database:', error)
    }
  }

  private async checkManifestVersion(): Promise<void> {
    const action = getDestinyManifest
    const callback = async (response: ServerResponse<DestinyManifest>) => {
      if (response?.Response?.version) {
        const currentVersion = response.Response.version
        if (currentVersion !== this.manifestVersion$.value) {
          await this.updateManifest(response.Response)
          this.manifestVersion$.next(currentVersion)
          localStorage.setItem(this.localStorageKey, currentVersion)
        }
      }
      return response
    }

    this.bungieQueue.addToQueue('getDestinyManifest', async () => {
      const response = await action()
      return callback(response)
    }).subscribe()
  }

  private async updateManifest(manifest: DestinyManifest): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const tables = {
      Activity: manifest.jsonWorldComponentContentPaths.en.DestinyActivityDefinition,
      ActivityMode: manifest.jsonWorldComponentContentPaths.en.DestinyActivityModeDefinition,
    }

    for (const [table, path] of Object.entries(tables)) {
      try {
        const response = await fetch(`https://www.bungie.net${path}`)
        const data = await response.json()
        const tx = this.db.transaction(table, 'readwrite')
        const store = tx.objectStore(table)
        await store.clear()
        for (const [key, value] of Object.entries(data)) {
          await store.put(value, key)
        }
        await tx.done
      } catch (error) {
        console.error(`Failed to update ${table} manifest:`, error)
      }
    }
  }

  getActivityDefinition(hash: number): Observable<DestinyActivityDefinition | undefined> {
    if (!this.db) {
      return of(undefined)
    }
    return from(this.db.get('Activity', hash.toString())).pipe(
      catchError(() => of(undefined))
    )
  }

  getActivityModeDefinition(hash: DestinyActivityModeType): Observable<DestinyActivityModeDefinition | undefined> {
    if (!this.db) {
      return of(undefined)
    }
    return from(this.db.get('ActivityMode', hash.toString())).pipe(
      catchError(() => of(undefined))
    )
  }

  getActivityName(hash: number): Observable<string> {
    return this.getActivityDefinition(hash).pipe(
      map(def => def?.displayProperties?.name || 'Unknown Activity')
    )
  }

  getActivityModeName(hash: number): Observable<string> {
    return this.getActivityModeDefinition(hash).pipe(
      map(def => def?.displayProperties?.name || 'Unknown Mode')
    )
  }

  set loaded(loaded: boolean) {
    this.setState({ loaded, error: undefined })
  }

  set statusText(statusText: string) {
    this.setState({ statusText })
  }

  private async saveManifestToIndexedDB(manifest: Record<string, unknown>, version: string, tables: string[]): Promise<void> {
    try {
      await set(this.idbKey, manifest)
      localStorage.setItem(this.localStorageKey, version)
      localStorage.setItem(this.localStorageKey + '-whitelist', JSON.stringify(tables))
    } catch (e) {
      console.error('Error saving manifest to IndexedDB:', e)
    }
  }

  private deleteManifestFile(): void {
    localStorage.removeItem(this.localStorageKey)
    del(this.idbKey)
  }

  private setState(newState: Partial<ManifestServiceState>): void {
    this.state = { ...this.state, ...newState }
    this.state$.next(this.state)
  }
}

export interface ManifestServiceState {
  loaded: boolean
  error?: Error
  statusText?: string
}
