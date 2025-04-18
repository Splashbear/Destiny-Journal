import { 
  DestinyHistoricalStatsActivity, 
  DestinyHistoricalStatsPeriodGroup, 
  DestinyHistoricalStatsValue,
  DestinyActivityModeType,
  BungieMembershipType,
  DestinyClass
} from 'quria';

export type DestinyVersion = 'Destiny1' | 'Destiny2';

export interface Activity extends DestinyHistoricalStatsPeriodGroup {
  activityType: string;
  duration: string;
  year: number;
  destinyVersion: DestinyVersion;
  activityDetails: DestinyHistoricalStatsActivity & {
    mode: DestinyActivityModeType;
    directorActivityHash: number;
    referenceId: number;
    instanceId: string;
    isPrivate: boolean;
  };
  values: {
    [key: string]: DestinyHistoricalStatsValue;
    timePlayedSeconds: DestinyHistoricalStatsValue;
    kills?: DestinyHistoricalStatsValue;
    deaths?: DestinyHistoricalStatsValue;
    assists?: DestinyHistoricalStatsValue;
    killsDeathsRatio?: DestinyHistoricalStatsValue;
    standing?: DestinyHistoricalStatsValue;
    completed?: DestinyHistoricalStatsValue;
  };
}

export interface ActivityMode {
  modeType: DestinyActivityModeType;
  name: string;
  description: string;
  icon?: string;
  pgcrImage?: string;
  category?: string;
  isD1Compatible?: boolean;
  isD2Compatible?: boolean;
} 