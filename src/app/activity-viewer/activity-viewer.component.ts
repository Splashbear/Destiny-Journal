import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { BungieAuthService } from '../bungie-auth/bungie-auth.service';
import { ManifestService } from '../manifest/manifest.service';
import { BungieQueueService } from '../services/queue.service';
import { Activity, DestinyVersion } from '../types/activity.types';
import { BehaviorSubject, forkJoin, Observable, of, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, take, tap } from 'rxjs/operators';
import { 
  DestinyActivityHistoryResults,
  DestinyActivityModeType,
  DestinyCharacterComponent,
  DestinyCharacterResponse,
  DestinyComponentType,
  DestinyHistoricalStatsAccountResult,
  DestinyHistoricalStatsPeriodGroup,
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
  styleUrls: ['./activity-viewer.component.css']
})
export class ActivityViewerComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private membershipDataForCurrentUser$ = new BehaviorSubject<ServerResponse<UserMembershipData> | undefined>(undefined);
  private accountResponse$ = new BehaviorSubject<ServerResponse<DestinyHistoricalStatsAccountResult>[]>([]);
  public displayName = '';
  public characters$: Observable<DestinyCharacterComponent[]>;
  public activities: Activity[] = [];
  public loading = false;
  public errorStatus = '';
  public errorMessage = '';

  date = new FormControl(new Date());

  constructor(
    private bungieAuth: BungieAuthService,
    private manifestService: ManifestService,
    private bungieQueue: BungieQueueService
  ) {
    this.characters$ = of([]);
  }

  ngOnInit() {
    this.loadActivitiesForDate(new Date());

    const authSub = this.bungieAuth.hasValidAccessToken$
      .pipe(
        distinctUntilChanged(),
        tap((hasValidAccessToken) => {
          if (hasValidAccessToken) {
            const action = getMembershipDataForCurrentUser;
            const callback = (response: ServerResponse<UserMembershipData>) => {
              if (response?.Response) {
                this.membershipDataForCurrentUser$.next(response);
              }
              return response;
            };
            const sub = this.bungieQueue.addToQueue('getMembershipDataForCurrentUser', action, callback).subscribe();
            this.subs.push(sub);
          }
        })
      )
      .subscribe();

    const membershipSub = this.membershipDataForCurrentUser$
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
              const params: GetHistoricalStatsForAccountParams = {
                destinyMembershipId: membershipId,
                membershipType,
                groups: [DestinyStatsGroupType.General],
              };
              return this.bungieQueue.addToQueue('getHistoricalStats', action, callback => {
                if (callback?.Response?.characters?.length > 0) {
                  return forkJoin(
                    callback.Response.characters.map((character) => {
                      const { characterId } = character;
                      const paramsB: GetCharacterParams = {
                        characterId,
                        destinyMembershipId: membershipId,
                        membershipType,
                        components: [DestinyComponentType.Characters],
                      };
                      return this.bungieQueue.addToQueue('getCharacter', getCharacter, (res: ServerResponse<DestinyCharacterResponse>) => {
                        if (res?.Response?.character?.data) {
                          return res.Response.character.data;
                        }
                        return null;
                      }, paramsB);
                    })
                  );
                }
                return of([]);
              }, params);
            })
          );
        })
      )
      .subscribe((responses) => {
        this.accountResponse$.next(responses);
      });

    this.subs.push(authSub, membershipSub);
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
    this.activities = []; // Clear existing activities

    this.membershipDataForCurrentUser$.pipe(take(1)).subscribe((userMembershipData) => {
      if (!userMembershipData?.Response?.destinyMemberships) {
        this.loading = false;
        this.errorStatus = 'No membership data';
        this.errorMessage = 'Unable to load membership data';
        return;
      }

      // Get the current year and Destiny's release year (2014)
      const currentYear = new Date().getFullYear();
      const destinyReleaseYear = 2014;
      const destiny2ReleaseDate = new Date('2017-09-06');

      // Create a date object for the selected date
      const selectedDate = new Date(date);
      
      // Create an array of all years from release to current
      const years = Array.from(
        { length: currentYear - destinyReleaseYear + 1 },
        (_, i) => currentYear - i
      );

      // For each membership and year, fetch activities for both Destiny 1 and 2
      userMembershipData.Response.destinyMemberships.forEach((destinyMembership) => {
        const { membershipId, membershipType } = destinyMembership;
        
        years.forEach(year => {
          // Create a date object for the selected date in each year
          const yearDate = new Date(date);
          yearDate.setFullYear(year);

          // Fetch Destiny 1 activities for all years (Destiny 1 is still active)
          const d1Params: GetActivityHistoryParams = {
            characterId: '0',
            destinyMembershipId: membershipId,
            membershipType,
            mode: DestinyActivityModeType.AllPvP,
            count: 250,
            page: 0,
          };
          this.addHistorySub(d1Params, yearDate, 'Destiny1');

          // Only fetch Destiny 2 activities if the date is after Destiny 2's release
          if (yearDate >= destiny2ReleaseDate) {
            const d2Params: GetActivityHistoryParams = {
              characterId: '0',
              destinyMembershipId: membershipId,
              membershipType,
              mode: DestinyActivityModeType.AllPvP,
              count: 250,
              page: 0,
            };
            this.addHistorySub(d2Params, yearDate, 'Destiny2');
          }
        });
      });
    });
  }

  private async addHistorySub(params: GetActivityHistoryParams, targetDate: Date, destinyVersion: DestinyVersion) {
    const action = getActivityHistory;
    const callback = async (response: ServerResponse<DestinyActivityHistoryResults>) => {
      if (response?.Response?.activities) {
        const activities = await Promise.all(
          response.Response.activities
            .filter((activity) => {
              const activityDate = new Date(activity.period);
              return (
                activityDate.getMonth() === targetDate.getMonth() &&
                activityDate.getDate() === targetDate.getDate() &&
                activityDate.getFullYear() === targetDate.getFullYear()
              );
            })
            .map(async (activity: DestinyHistoricalStatsPeriodGroup) => ({
              ...activity,
              activityType: await this.getActivityType(activity),
              duration: this.getActivityDuration(activity),
              year: new Date(activity.period).getFullYear(),
              destinyVersion,
            }))
        );
        this.activities = [...this.activities, ...activities as Activity[]];
      }
      this.loading = false;
      return response;
    };
    const sub = this.bungieQueue.addToQueue('getActivityHistory', action, callback, params).subscribe();
    this.subs.push(sub);
  }

  private isSameDay(date1: Date, date2: Date | null): boolean {
    if (!date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private async getActivityType(activity: DestinyHistoricalStatsPeriodGroup): Promise<string> {
    const modeHash = activity.activityDetails.mode;
    return new Promise<string>((resolve) => {
      this.manifestService.getActivityModeName(modeHash)
        .pipe(take(1))
        .subscribe(name => resolve(name));
    });
  }

  getActivityDuration(activity: DestinyHistoricalStatsPeriodGroup): string {
    const start = new Date(activity.period);
    const end = new Date(activity.period);
    end.setSeconds(end.getSeconds() + activity.values.timePlayedSeconds.basic.value);
    return `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
  }

  getActivityTypes(): string[] {
    return [...new Set(this.activities.map(activity => activity.activityType))];
  }

  getYears(): number[] {
    const currentYear = new Date().getFullYear();
    const destinyReleaseYear = 2014;
    return Array.from(
      { length: currentYear - destinyReleaseYear + 1 },
      (_, i) => currentYear - i
    );
  }

  hasActivitiesForYear(year: number): boolean {
    return this.activities.some(activity => activity.year === year);
  }

  getActivityTypesForYear(year: number): string[] {
    return [...new Set(
      this.activities
        .filter(activity => activity.year === year)
        .map(activity => activity.activityType)
    )];
  }

  getActivitiesByTypeAndYear(type: string, year: number): Activity[] {
    return this.activities.filter(activity => 
      activity.activityType === type && activity.year === year
    );
  }

  getDestinyVersionsForYear(year: number): DestinyVersion[] {
    return [...new Set(
      this.activities
        .filter(activity => activity.year === year)
        .map(activity => activity.destinyVersion)
    )];
  }

  getActivitiesByTypeYearAndVersion(type: string, year: number, version: DestinyVersion): Activity[] {
    return this.activities.filter(activity => 
      activity.activityType === type && 
      activity.year === year && 
      activity.destinyVersion === version
    );
  }
} 