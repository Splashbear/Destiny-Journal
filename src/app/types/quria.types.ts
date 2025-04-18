import { 
  DestinyActivityModeType, 
  DestinyStatsGroupType, 
  BungieMembershipType,
  DestinyClass
} from 'quria';

export interface QuriaActivityHistoryParams {
  characterId: string;
  destinyMembershipId: string;
  membershipType: BungieMembershipType;
  mode: DestinyActivityModeType;
  count: number;
  page: number;
}

export interface QuriaActivity {
  period: string;
  activityDetails: {
    mode: DestinyActivityModeType;
    directorActivityHash: number;
    referenceId: number;
    instanceId: string;
    isPrivate: boolean;
  };
  values: {
    timePlayedSeconds: {
      basic: {
        value: number;
        displayValue: string;
      };
    };
    kills?: {
      basic: {
        value: number;
        displayValue: string;
      };
    };
    deaths?: {
      basic: {
        value: number;
        displayValue: string;
      };
    };
    assists?: {
      basic: {
        value: number;
        displayValue: string;
      };
    };
    killsDeathsRatio?: {
      basic: {
        value: number;
        displayValue: string;
      };
    };
  };
  activityType: string;
  duration: string;
  year: number;
  destinyVersion: 'Destiny1' | 'Destiny2';
}

export interface QuriaHistoricalStatsParams {
  destinyMembershipId: string;
  membershipType: BungieMembershipType;
  groups: DestinyStatsGroupType[];
}

export interface QuriaHistoricalStatsPeriodGroup {
  period: string;
  activityDetails: {
    mode: DestinyActivityModeType;
    directorActivityHash: number;
    referenceId: number;
    instanceId: string;
    isPrivate: boolean;
  };
  values: {
    [key: string]: {
      basic: {
        value: number;
        displayValue: string;
      };
    };
  };
}

export interface QuriaActivityHistoryOptions {
  mode?: DestinyActivityModeType;
  count?: number;
  page?: number;
} 