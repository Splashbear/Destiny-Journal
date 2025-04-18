import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ActivatedRoute } from '@angular/router';
import { ManifestService } from '../manifest/manifest.service';
import { BungieQueueService } from '../services/queue.service';
import { DestinyVersion } from '../types/activity.types';
import { 
  QuriaActivity, 
  QuriaActivityHistoryParams,
  QuriaHistoricalStatsParams,
  QuriaHistoricalStatsPeriodGroup,
  QuriaActivityHistoryOptions
} from '../types/quria.types';
import { 
  QuriaApiParams,
  QuriaProfileComponents,
  QuriaActivityParams,
  QuriaStatsParams,
  convertMembershipType,
  callQuriaApi
} from '../types/quria-mappings';
import { BungieApiError, BungieErrorCode } from '../types/bungie-errors';
import { BehaviorSubject, forkJoin, Observable, of, Subscription, from } from 'rxjs';
import { distinctUntilChanged, switchMap, take, tap, map } from 'rxjs/operators';
import { 
  Quria,
  DestinyActivityModeType,
  DestinyCharacterComponent,
  DestinyHistoricalStatsAccountResult,
  DestinyStatsGroupType,
  UserMembershipData,
  UserInfoCard,
  BungieMembershipType,
  DestinyClass,
  GroupUserInfoCard,
  DestinyProfileUserInfoCard
} from 'quria';
import { PlatformIconComponent } from '../components/platform-icon/platform-icon.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-activity-viewer',
  templateUrl: './activity-viewer.component.html',
  styleUrls: ['./activity-viewer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    PlatformIconComponent
  ]
})
export class ActivityViewerComponent implements OnInit, OnDestroy {
  private readonly DESTINY1_RELEASE_DATE = new Date('2014-09-09');
  private readonly DESTINY2_RELEASE_DATE = new Date('2017-09-06');
  private readonly D1_ACTIVITY_MODES: DestinyActivityModeType[] = [
    DestinyActivityModeType.AllPvP,
    DestinyActivityModeType.AllPvE,
    DestinyActivityModeType.Raid
  ];
  private readonly D2_ACTIVITY_MODES: DestinyActivityModeType[] = [
    DestinyActivityModeType.AllPvP,
    DestinyActivityModeType.AllPvE,
    DestinyActivityModeType.Raid,
    DestinyActivityModeType.Dungeon,
    DestinyActivityModeType.Social
  ];

  private subs: Subscription[] = [];
  private membershipData$ = new BehaviorSubject<UserMembershipData | undefined>(undefined);
  private accountResponse$ = new BehaviorSubject<DestinyHistoricalStatsAccountResult[]>([]);
  public displayName = '';
  public characters$: Observable<DestinyCharacterComponent[]>;
  public activities: QuriaActivity[] = [];
  public loading = false;
  public errorStatus = '';
  public errorMessage = '';
  public username = '';
  public membershipType?: BungieMembershipType;
  public activityTypeFilter = new FormControl<DestinyActivityModeType[]>([]);
  public destinyVersionFilter = new FormControl<DestinyVersion[]>([]);

  date = new FormControl<Date>(new Date());
  private quria: Quria;

  constructor(
    private route: ActivatedRoute,
    private manifestService: ManifestService,
    private bungieQueueService: BungieQueueService,
    private http: HttpClient
  ) {
    this.quria = new Quria({
      API_KEY: 'YOUR_API_KEY' // Replace with your actual API key
    });
    this.characters$ = this.membershipData$.pipe(
      switchMap((data) => {
        if (!data?.destinyMemberships?.[0]) {
          return of([]);
        }
        return from(this.getCharactersForMembership(data.destinyMemberships[0]));
      })
    );
  }

  private async getCharactersForMembership(membership: GroupUserInfoCard): Promise<DestinyCharacterComponent[]> {
    try {
      const params: QuriaApiParams = {
        membershipId: membership.membershipId,
        membershipType: membership.membershipType
      };
      const components: QuriaProfileComponents = {
        components: [200] // ComponentType.Characters
      };
      
      const response = await callQuriaApi<{ characters: { data: { characters: DestinyCharacterComponent[] } } }>(
        this.quria.destiny2.GetProfile.bind(this.quria.destiny2),
        params.membershipId,
        params.membershipType,
        components
      );
      
      if (response?.Response?.characters?.data?.characters) {
        return response.Response.characters.data.characters;
      }
      return [];
    } catch (error) {
      console.error('Error fetching characters:', error);
      return [];
    }
  }

  ngOnInit() {
    this.subs.push(
      this.route.params.subscribe((params) => {
        this.username = params['username'];
        if (this.username) {
          this.loadUserData();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  private loadUserData() {
    this.loading = true;
    this.errorStatus = '';
    this.errorMessage = '';

    this.bungieQueueService.addToQueue('searchDestinyPlayer', async () => {
      try {
        interface SearchResponse {
          Response: UserInfoCard[];
          ErrorCode: number;
          ErrorStatus: string;
          Message: string;
          MessageData: { [key: string]: string };
        }

        const response = await this.http.get<SearchResponse>(`https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/${encodeURIComponent(this.username)}/`).toPromise();
        if (response?.Response?.length > 0) {
          const membership = response.Response[0];
          this.membershipData$.next({
            destinyMemberships: [membership]
          } as UserMembershipData);
          this.displayName = membership.displayName;
          this.membershipType = membership.membershipType;
          this.loadActivities();
        } else {
          this.errorStatus = 'Error';
          this.errorMessage = 'User not found';
        }
      } catch (error) {
        this.errorStatus = 'Error';
        this.errorMessage = 'Failed to search for user';
        console.error('Error searching for user:', error);
      }
      this.loading = false;
    }).subscribe();
  }

  private getActivityHistory(params: QuriaActivityHistoryParams) {
    return this.bungieQueueService.addToQueue('getActivityHistory', async () => {
      const activityParams: QuriaActivityParams = {
        count: params.count,
        mode: params.mode,
        page: params.page
      };
      
      interface ActivityHistoryResponse {
        activities: QuriaHistoricalStatsPeriodGroup[];
      }

      const response = await callQuriaApi<ActivityHistoryResponse>(
        this.quria.destiny2.GetActivityHistory.bind(this.quria.destiny2),
        params.destinyMembershipId,
        params.membershipType,
        params.characterId,
        activityParams
      );

      if (response?.ErrorCode !== BungieErrorCode.Success) {
        throw new BungieApiError(
          response?.ErrorCode || BungieErrorCode.UnhandledException,
          response?.ErrorStatus || 'Unknown Error',
          response?.Message || 'Failed to get activity history',
          response?.ThrottleSeconds
        );
      }

      return response?.Response?.activities || [];
    });
  }

  private getHistoricalStats(params: QuriaHistoricalStatsParams) {
    return this.bungieQueueService.addToQueue('getHistoricalStats', async () => {
      const statsParams: QuriaStatsParams = {
        groups: params.groups
      };
      
      interface HistoricalStatsResponse {
        characters: DestinyHistoricalStatsAccountResult[];
      }

      const response = await callQuriaApi<HistoricalStatsResponse>(
        this.quria.destiny2.GetHistoricalStatsForAccount.bind(this.quria.destiny2),
        params.destinyMembershipId,
        params.membershipType,
        statsParams
      );

      if (response?.ErrorCode !== BungieErrorCode.Success) {
        throw new BungieApiError(
          response?.ErrorCode || BungieErrorCode.UnhandledException,
          response?.ErrorStatus || 'Unknown Error',
          response?.Message || 'Failed to get historical stats',
          response?.ThrottleSeconds
        );
      }

      return response?.Response?.characters || [];
    });
  }

  private getActivityType(activity: QuriaHistoricalStatsPeriodGroup): string {
    return activity.activityDetails.mode.toString();
  }

  private getActivityDuration(activity: QuriaHistoricalStatsPeriodGroup): string {
    const start = new Date(activity.period);
    const end = new Date(activity.period);
    end.setSeconds(end.getSeconds() + activity.values.timePlayedSeconds.basic.value);
    return `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
  }

  private getDestinyVersion(activity: QuriaHistoricalStatsPeriodGroup): DestinyVersion {
    const activityDate = new Date(activity.period);
    return activityDate >= this.DESTINY2_RELEASE_DATE ? 'Destiny2' : 'Destiny1';
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.date.setValue(event.value);
      this.loadActivities();
    }
  }

  onActivityTypeChange(types: DestinyActivityModeType[]) {
    this.activityTypeFilter.setValue(types);
    this.loadActivities();
  }

  onDestinyVersionChange(versions: DestinyVersion[]) {
    this.destinyVersionFilter.setValue(versions);
    this.loadActivities();
  }

  private async loadActivities() {
    if (!this.membershipData$.value) {
      return;
    }

    const membership = this.membershipData$.value.destinyMemberships[0];
    if (!membership) {
      return;
    }

    this.loading = true;
    this.errorStatus = '';
    this.errorMessage = '';

    try {
      const characters = await this.getCharactersForMembership(membership);
      if (characters.length === 0) {
        throw new Error('No characters found');
      }

      const params: QuriaActivityHistoryParams = {
        characterId: characters[0].characterId,
        destinyMembershipId: membership.membershipId,
        membershipType: membership.membershipType as BungieMembershipType,
        mode: this.activityTypeFilter.value?.[0] || DestinyActivityModeType.None,
        count: 25,
        page: 0
      };

      this.getActivityHistory(params).subscribe((activities) => {
        this.activities = activities.map(activity => ({
          period: activity.period,
          activityDetails: {
            mode: activity.activityDetails.mode,
            directorActivityHash: activity.activityDetails.directorActivityHash,
            referenceId: activity.activityDetails.referenceId,
            instanceId: activity.activityDetails.instanceId,
            isPrivate: activity.activityDetails.isPrivate
          },
          values: {
            timePlayedSeconds: activity.values.timePlayedSeconds,
            kills: activity.values.kills,
            deaths: activity.values.deaths,
            assists: activity.values.assists,
            killsDeathsRatio: activity.values.killsDeathsRatio
          },
          activityType: this.getActivityType(activity),
          duration: this.getActivityDuration(activity),
          year: new Date(activity.period).getFullYear(),
          destinyVersion: this.getDestinyVersion(activity)
        }));
        this.loading = false;
      });
    } catch (error) {
      this.errorStatus = 'Error';
      this.errorMessage = 'Failed to load characters';
      this.loading = false;
    }
  }
} 