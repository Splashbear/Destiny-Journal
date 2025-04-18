import { DestinyHistoricalStatsActivity, DestinyHistoricalStatsPeriodGroup, DestinyHistoricalStatsValue } from 'bungie-api-ts/destiny2';

export namespace destiny {
  export interface Activity extends DestinyHistoricalStatsPeriodGroup {
    activityType?: string;
    duration?: string;
    activityDetails: DestinyHistoricalStatsActivity;
    values: {
      [key: string]: DestinyHistoricalStatsValue;
    } & {
      timePlayedSeconds: {
        basic: {
          value: number;
        };
      };
    };
  }
} 