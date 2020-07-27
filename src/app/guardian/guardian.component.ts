import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';
import { ServerResponse } from 'bungie-api-ts/common';
import {
  DestinyActivityHistoryResults,
  DestinyCharacterComponent,
  DestinyProfileResponse
} from 'bungie-api-ts/destiny2';
import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  empty as observableEmpty,
  Observable,
  Subscription,
  throwError as observableThrowError
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  switchMap
} from 'rxjs/operators';
import { DestinyActivityModeDefinition } from '../defs/DestinyActivityModeDefinition';
import { scrubland } from '../scrubland.typings';
import { BungieHttpService } from '../services/bungie-http.service';
import { DayModalComponent } from './day-modal/day-modal.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-guardian',
  templateUrl: './guardian.component.html',
  styleUrls: ['./guardian.component.scss']
})
export class GuardianComponent implements OnInit, OnDestroy {
  private subs: Subscription[];
  private membershipType: Observable<string>;
  private membershipId: Observable<string>;
  private accountResponse: Observable<ServerResponse<DestinyProfileResponse>>;
  private flatDaysBS: BehaviorSubject<any[]>;
  public displayName: Observable<string>;
  public characters: Observable<DestinyCharacterComponent[]>;
  public minutesPlayedTotal: Observable<number>;
  public activities: scrubland.Activity[];
  public days: {};
  public flatDays: any[][];
  public yearKeys: string[];
  public monthKeys;
  public monthOffsets;
  public dayKeys;
  public Math;
  public calendarFilter: any;
  public modeOptions: any[];
  public loadingArray: { loading: boolean }[];
  public errorStatus: string;
  public errorMessage: string;

  constructor(
    private bHttp: BungieHttpService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog
  ) {
    this.Math = Math;
  }

  addDay(day) {
    if (!this.days[day.getFullYear()]) {
      this.days[day.getFullYear()] = {};
    }
    if (!this.days[day.getFullYear()][day.getMonth() + 1]) {
      this.days[day.getFullYear()][day.getMonth() + 1] = {};
    }
    if (!this.days[day.getFullYear()][day.getMonth() + 1][day.getDate()]) {
      this.days[day.getFullYear()][day.getMonth() + 1][day.getDate()] = [];
    }
    this.flatDays.push(
      this.days[day.getFullYear()][day.getMonth() + 1][day.getDate()]
    );
  }

  ngOnInit() {
    this.loadingArray = [];
    this.calendarFilter = '0';
    this.subs = [];
    this.activities = [];
    this.days = {};
    this.flatDays = [];
    this.flatDaysBS = new BehaviorSubject([]);
    this.modeOptions = Object.keys(DestinyActivityModeDefinition['en']);
    this.errorStatus = '';
    this.errorMessage = '';

    const day = new Date('Sept 1, 2017');
    const now = new Date();
    while (day <= now) {
      this.addDay(day);
      day.setDate(day.getDate() + 1);
    }
    this.flatDaysBS.next(this.flatDays);
    this.yearKeys = Object.keys(this.days);
    this.monthKeys = {};
    this.monthOffsets = { 2017: { 9: 5 } };
    let previousOffset = 5;
    let previousCount = 30;
    this.dayKeys = {};
    this.yearKeys.forEach(year => {
      this.monthKeys[year] = Object.keys(this.days[year]);
      if (!this.monthOffsets[year]) {
        this.monthOffsets[year] = {};
      }
      this.dayKeys[year] = {};
      this.monthKeys[year].forEach(month => {
        if (!this.monthOffsets[year][month]) {
          this.monthOffsets[year][month] = (previousCount + previousOffset) % 7;
          previousCount = Object.keys(this.days[year][month]).length;
          previousOffset = this.monthOffsets[year][month];
        }
        this.dayKeys[year][month] = Object.keys(this.days[year][month]);
      });
    });

    this.membershipId = this.activatedRoute.params.pipe(
      map((params: Params) => {
        return params['membershipId'];
      })
    );
    this.membershipType = this.activatedRoute.params.pipe(
      map((params: Params) => {
        return params['membershipType'];
      })
    );

    this.accountResponse = observableCombineLatest(
      this.membershipId,
      this.membershipType
    ).pipe(
      map(([membershipId, membershipType]) => {
        try {
          if (membershipType && membershipId) {
            return (
              'https://www.bungie.net/Platform/Destiny2/' +
              membershipType +
              '/Profile/' +
              membershipId +
              '/?components=100,200'
            );
          } else {
            return '';
          }
        } catch (e) {
          return '';
        }
      }),
      distinctUntilChanged(),
      switchMap(url => {
        if (url.length) {
          return this.bHttp
            .get(url)
            .pipe(
              catchError((error: HttpErrorResponse) =>
                observableThrowError(error.error || 'Server error')
              )
            );
        } else {
          return observableEmpty();
        }
      })
    );

    this.displayName = this.accountResponse.pipe(
      map(res => {
        if (res.ErrorCode !== 1 && res.ErrorStatus) {
          this.errorStatus = res.ErrorStatus;
          this.errorMessage = res.Message;
        }
        return res.Response.profile.data.userInfo.displayName;
      })
    );
    this.characters = this.accountResponse.pipe(
      map(res => {
        if (res.ErrorCode !== 1 && res.ErrorStatus) {
          this.errorStatus = res.ErrorStatus;
          this.errorMessage = res.Message;
        }
        const characters = [];
        try {
          Object.keys(res.Response.characters.data).forEach(key => {
            characters.push(res.Response.characters.data[key]);
          });
        } catch (e) {}
        return characters;
      })
    );

    this.minutesPlayedTotal = this.characters.pipe(
      map(characters => {
        let minutesPlayed = 0;
        characters.forEach(character => {
          minutesPlayed += +character.minutesPlayedTotal;
        });
        return minutesPlayed;
      })
    );

    this.subs.push(
      observableCombineLatest(
        this.membershipId,
        this.membershipType,
        this.characters
      )
        .pipe(distinctUntilChanged())
        .subscribe(([membershipId, membershipType, characters]) => {
          this.activities = [];
          characters.forEach(character => {
            const url =
              'https://www.bungie.net/Platform/Destiny2/' +
              membershipType +
              '/Account/' +
              membershipId +
              '/Character/' +
              character.characterId +
              '/Stats/Activities/?mode=None&count=250&page=';
            this.addHistorySub(url, 0);
            this.addHistorySub(url, 1);
            this.addHistorySub(url, 2);
          });
        })
    );
  }

  addHistorySub(url: string, page: number) {
    const loading = { loading: true };
    this.loadingArray.push(loading);

    this.subs.push(
      this.bHttp
        .get(url + page)
        .pipe(
          catchError((error: HttpErrorResponse) =>
            observableThrowError(error.error || 'Server error')
          )
        )
        .subscribe((res: ServerResponse<DestinyActivityHistoryResults>) => {
          if (res.ErrorCode !== 1 && res.ErrorStatus) {
            this.errorStatus = res.ErrorStatus;
            this.errorMessage = res.Message;
          }
          if (res.Response.activities && res.Response.activities.length) {
            this.addHistorySub(url, page + 3);
            res.Response.activities.forEach((activity: scrubland.Activity) => {
              activity.startDate = new Date(activity.period);
              activity.startDate.setSeconds(
                activity.startDate.getSeconds() +
                  activity.values.startSeconds.basic.value
              );
              activity.endDate = new Date(activity.startDate.getTime());
              activity.endDate.setSeconds(
                activity.startDate.getSeconds() +
                  activity.values.timePlayedSeconds.basic.value
              );
              this.activities.push(activity);
              try {
                this.days[activity.startDate.getFullYear()][
                  activity.startDate.getMonth() + 1
                ][activity.startDate.getDate()].push(activity);
              } catch (e) {}
              this.flatDaysBS.next(this.flatDays);
            });
          }
          loading.loading = false;
        })
    );
  }

  openDay(date, day) {
    const dialogRef = this.dialog.open(DayModalComponent, {
      data: {
        date: date,
        activities: day
      },
      width: '300px'
    });
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
