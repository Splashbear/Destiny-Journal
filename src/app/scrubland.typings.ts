import { 
  DestinyHistoricalStatsActivity, 
  DestinyHistoricalStatsPeriodGroup, 
  DestinyHistoricalStatsValue,
  DestinyActivityModeType,
  ServerResponse
} from 'bungie-api-ts/destiny2';

declare namespace destiny {
  interface Activity extends DestinyHistoricalStatsPeriodGroup {
    activityType: string;
    duration: string;
    activityDetails: DestinyHistoricalStatsActivity;
    values: {
      [key: string]: DestinyHistoricalStatsValue;
      timePlayedSeconds: DestinyHistoricalStatsValue;
    };
  }

  interface ActivityMode {
    modeType: DestinyActivityModeType;
    name: string;
    description: string;
  }
}

export { destiny }; 