import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { BungieAuthService } from '../bungie-auth/bungie-auth.service';
import { ManifestService } from '../manifest/manifest.service';
import { BungieQueueService } from '../services/queue.service';
import { destiny } from '../scrubland.typings';
import { BehaviorSubject, EMPTY, forkJoin, Observable, of, Subscription } from 'rxjs';
import { distinctUntilChanged, map, switchMap, take, tap } from 'rxjs/operators';
import { 
  DestinyActivityHistoryResults,
  DestinyActivityModeType,
  DestinyCharacterComponent,
  DestinyCharacterResponse,
  DestinyComponentType,
  DestinyHistoricalStatsAccountResult,
  DestinyStatsGroupType,
  getActivityHistory,
  GetActivityHistoryParams,
  getCharacter,
  GetCharacterParams,
  getHistoricalStatsForAccount,
  GetHistoricalStatsForAccountParams,
} from 'bungie-api-ts/destiny2';
import { getMembershipDataForCurrentUser, UserMembershipData } from 'bungie-api-ts/user';

@Component({
  selector: 'app-activity-viewer',
  templateUrl: './activity-viewer.component.html',
  styleUrls: ['./activity-viewer.component.scss']
})
export class ActivityViewerComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private membershipDataForCurrentUser$: BehaviorSubject<any> = new BehaviorSubject(undefined);
  private accountResponse$: BehaviorSubject<any> = new BehaviorSubject([]);
  public displayName = '';
  public characters$: Observable<DestinyCharacterComponent[]> = of([]);
  public activities: destiny.Activity[] = [];
  public loading = false;
  public errorStatus = '';
  public errorMessage = '';

  date = new FormControl(new Date());

  constructor(
    private bungieAuth: BungieAuthService,
    private manifestService: ManifestService,
    private bungieQueue: BungieQueueService
  ) {}

  ngOnInit() {
    this.loadActivitiesForDate(new Date());

    this.subs.push(
      this.bungieAuth.hasValidAccessToken$
        .pipe(
          distinctUntilChanged(),
          tap((hasValidAccessToken) => {
            if (hasValidAccessToken) {
              const action = getMembershipDataForCurrentUser;
              const callback = (response: any) => {
                this.membershipDataForCurrentUser$.next(response);
              };
              this.bungieQueue.addToQueue('getProfile', action, callback);
            }
          })
        )
        .subscribe()
    );

    this.subs.push(
      this.membershipDataForCurrentUser$
        .pipe(
          distinctUntilChanged(),
          switchMap((userMembershipData) => {
            if (!userMembershipData?.Response?.destinyMemberships) {
              return of([]);
            }
            return forkJoin(
              userMembershipData.Response.destinyMemberships.map((destinyMembership) => {
                const { membershipId, membershipType } = destinyMembership;
                const action = getHistoricalStatsForAccount;
                const callback = (response: any) => {
                  if (response?.Response?.characters?.length > 0) {
                    return forkJoin(
                      response.Response.characters.map((character) => {
                        const { characterId } = character;
                        const actionB = getCharacter;
                        const callbackB = (res: any) => {
                          if (res?.Response?.character) {
                            return res.Response.character;
                          }
                          return null;
                        };
                        const paramsB: GetCharacterParams = {
                          characterId,
                          destinyMembershipId: membershipId,
                          membershipType,
                          components: [DestinyComponentType.Characters],
                        };
                        return this.bungieQueue.addToQueue('getProfile', actionB, callbackB, paramsB);
                      })
                    );
                  }
                  return of([]);
                };
                const params: GetHistoricalStatsForAccountParams = {
                  destinyMembershipId: membershipId,
                  membershipType,
                  groups: [DestinyStatsGroupType.General],
                };
                return this.bungieQueue.addToQueue('getProfile', action, callback, params);
              })
            );
          })
        )
        .subscribe((characters) => {
          this.characters$ = of([].concat(...characters));
          this.loadActivitiesForDate(this.date.value);
        })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.loadActivitiesForDate(event.value);
    }
  }

  private loadActivitiesForDate(date: Date) {
    this.loading = true;
    this.errorStatus = '';
    this.errorMessage = '';
    this.activities = [];

    this.characters$.pipe(take(1)).subscribe((characters) => {
      if (!characters.length) {
        this.loading = false;
        return;
      }

      characters.forEach((character) => {
        const params: GetActivityHistoryParams = {
          destinyMembershipId: character.membershipId,
          membershipType: character.membershipType,
          characterId: character.characterId,
          mode: 0,
          count: 250,
        };
        this.addHistorySub({ ...params, page: 0 });
      });
    });
  }

  private addHistorySub(params: GetActivityHistoryParams) {
    const behaviorSubject: BehaviorSubject<any> = new BehaviorSubject(undefined);
    const action = getActivityHistory;
    const callback = (response: any) => {
      behaviorSubject.next(response);
    };
    this.bungieQueue.addToQueue('getActivityHistory', action, callback, params);

    this.subs.push(
      behaviorSubject.subscribe((res: any) => {
        if (res?.ErrorCode !== 1 && res?.ErrorStatus) {
          this.errorStatus = res.ErrorStatus;
          this.errorMessage = res.Message;
        }
        if (res?.Response?.activities?.length) {
          res.Response.activities.forEach((activity: destiny.Activity) => {
            activity.characterId = params.characterId;
            const period = new Date(activity.period);
            const startDate = period.getTime() / 1000 + activity.values.startSeconds.basic.value;
            const endDate = startDate + activity.values.timePlayedSeconds.basic.value;
            activity.startDate = new Date(startDate * 1000);
            activity.endDate = new Date(endDate * 1000);

            if (this.isSameDay(activity.startDate, this.date.value)) {
              this.activities.push(activity);
            }
          });
        }
        this.loading = false;
      })
    );
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  getActivityType(activity: destiny.Activity): string {
    return this.manifestService.defs.ActivityMode.get(activity.activityDetails.mode)?.displayProperties.name || 'Unknown';
  }

  getActivityDuration(activity: destiny.Activity): string {
    if (activity.startDate && activity.endDate) {
      const duration = activity.endDate.getTime() - activity.startDate.getTime();
      const minutes = Math.floor(duration / 60000);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return 'Unknown';
  }

  getActivityTypes(): string[] {
    const types = new Set<string>();
    this.activities.forEach(activity => {
      const type = this.getActivityType(activity);
      if (type) {
        types.add(type);
      }
    });
    return Array.from(types).sort();
  }

  getActivitiesByType(type: string): destiny.Activity[] {
    return this.activities.filter(activity => this.getActivityType(activity) === type);
  }
} 