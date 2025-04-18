import { 
  DestinyHistoricalStatsActivity, 
  DestinyHistoricalStatsPeriodGroup, 
  DestinyHistoricalStatsValue,
  DestinyActivityModeType,
  ServerResponse
} from 'bungie-api-ts/destiny2';

export namespace destiny {
  export interface Activity extends DestinyHistoricalStatsPeriodGroup {
    activityType: string;
    duration: string;
    activityDetails: DestinyHistoricalStatsActivity;
    values: {
      [key: string]: DestinyHistoricalStatsValue;
      timePlayedSeconds: DestinyHistoricalStatsValue;
    };
  }

  export interface ActivityMode {
    modeType: DestinyActivityModeType;
    name: string;
    description: string;
  }

  export interface BungieResponse<T> extends ServerResponse<T> {
    statusCode?: number;
  }
} 