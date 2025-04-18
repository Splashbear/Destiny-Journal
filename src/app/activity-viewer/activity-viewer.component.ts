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
  ServerResponse,
} from 'bungie-api-ts/destiny2';
import { getMembershipDataForCurrentUser, UserMembershipData } from 'bungie-api-ts/user';

@Component({
  selector: 'app-activity-viewer',
  templateUrl: './activity-viewer.component.html',
  styleUrls: ['./activity-viewer.component.scss']
})
export class ActivityViewerComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private membershipDataForCurrentUser$ = new BehaviorSubject<ServerResponse<UserMembershipData> | undefined>(undefined);
  private accountResponse$ = new BehaviorSubject<ServerResponse<DestinyHistoricalStatsAccountResult>[]>([]);
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
              const callback = (response: ServerResponse<UserMembershipData>) => {
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
                const callback = (response: ServerResponse<DestinyHistoricalStatsAccountResult>) => {
                  if (response?.Response?.characters?.length > 0) {
                    return forkJoin(
                      response.Response.characters.map((character) => {
                        const { characterId } = character;
                        const actionB = getCharacter;
                        const callbackB = (res: ServerResponse<DestinyCharacterResponse>) => {
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
                        return this.bungieQueue.addToQueue('getCharacter', actionB, callbackB, paramsB);
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
                return this.bungieQueue.addToQueue('getHistoricalStats', action, callback, params);
              })
            );
          })
        )
        .subscribe((responses) => {
          this.accountResponse$.next(responses);
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

    this.membershipDataForCurrentUser$.pipe(take(1)).subscribe((userMembershipData) => {
      if (!userMembershipData?.Response?.destinyMemberships) {
        this.loading = false;
        this.errorStatus = 'No membership data';
        this.errorMessage = 'Unable to load membership data';
        return;
      }

      userMembershipData.Response.destinyMemberships.forEach((destinyMembership) => {
        const { membershipId, membershipType } = destinyMembership;
        const params: GetActivityHistoryParams = {
          characterId: '0',
          destinyMembershipId: membershipId,
          membershipType,
          mode: DestinyActivityModeType.AllPvP,
          count: 250,
          page: 0,
        };
        this.addHistorySub(params);
      });
    });
  }

  private addHistorySub(params: GetActivityHistoryParams) {
    const action = getActivityHistory;
    const callback = (response: ServerResponse<DestinyActivityHistoryResults>) => {
      if (response?.Response?.activities) {
        this.activities = response.Response.activities
          .filter((activity) => this.isSameDay(new Date(activity.period), this.date.value))
          .map((activity) => ({
            ...activity,
            activityType: this.getActivityType(activity),
            duration: this.getActivityDuration(activity),
          }));
      }
      this.loading = false;
    };
    this.bungieQueue.addToQueue('getActivityHistory', action, callback, params);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  getActivityType(activity: destiny.Activity): string {
    return activity.activityDetails.mode.toString();
  }

  getActivityDuration(activity: destiny.Activity): string {
    const start = new Date(activity.period);
    const end = new Date(activity.period);
    end.setSeconds(end.getSeconds() + activity.values.timePlayedSeconds.basic.value);
    return `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
  }

  getActivityTypes(): string[] {
    return [...new Set(this.activities.map((activity) => this.getActivityType(activity)))].sort();
  }

  getActivitiesByType(type: string): destiny.Activity[] {
    return this.activities.filter((activity) => this.getActivityType(activity) === type);
  }
} 