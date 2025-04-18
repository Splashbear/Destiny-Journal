import { 
  BungieMembershipType, 
  DestinyActivityModeType,
  DestinyStatsGroupType 
} from 'quria';

export interface QuriaApiParams {
  membershipId: string;
  membershipType: BungieMembershipType;
  characterId?: string;
}

export interface QuriaProfileComponents {
  components: number[];
}

export interface QuriaActivityParams {
  count?: number;
  mode?: DestinyActivityModeType;
  page?: number;
}

export interface QuriaStatsParams {
  groups: DestinyStatsGroupType[];
}

// Convert BungieMembershipType to the format expected by the API
export const convertMembershipType = (type: BungieMembershipType): BungieMembershipType => {
  // The API expects the raw enum value
  return type;
}; 