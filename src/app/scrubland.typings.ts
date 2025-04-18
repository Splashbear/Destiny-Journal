import { 
  DestinyHistoricalStatsActivity, 
  DestinyHistoricalStatsPeriodGroup, 
  DestinyHistoricalStatsValue,
  DestinyActivityModeType
} from 'bungie-api-ts/destiny2';

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

  export interface ActivityMode {
    modeType: DestinyActivityModeType;
    name: string;
    description: string;
  }
} 