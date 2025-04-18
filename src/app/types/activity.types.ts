import { 
  DestinyHistoricalStatsActivity, 
  DestinyHistoricalStatsPeriodGroup, 
  DestinyHistoricalStatsValue,
  DestinyActivityModeType
} from 'bungie-api-ts/destiny2';

export type DestinyVersion = 'Destiny1' | 'Destiny2';

export interface Activity extends DestinyHistoricalStatsPeriodGroup {
  activityType: string;
  duration: string;
  year: number;
  destinyVersion: DestinyVersion;
  activityDetails: DestinyHistoricalStatsActivity;
  values: {
    [key: string]: DestinyHistoricalStatsValue;
    timePlayedSeconds: DestinyHistoricalStatsValue;
    kills?: DestinyHistoricalStatsValue;
    deaths?: DestinyHistoricalStatsValue;
    assists?: DestinyHistoricalStatsValue;
    killsDeathsRatio?: DestinyHistoricalStatsValue;
  };
}

export interface ActivityMode {
  modeType: DestinyActivityModeType;
  name: string;
  description: string;
} 