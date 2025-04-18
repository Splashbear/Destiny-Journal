import { 
  BungieMembershipType, 
  DestinyActivityModeType,
  DestinyStatsGroupType,
  APIResponse
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
export const convertMembershipType = (type: BungieMembershipType): string => {
  return type.toString();
};

// Wrapper function for Quria API calls
export const callQuriaApi = async <T>(
  apiCall: (membershipId: string, membershipType: string, ...args: any[]) => Promise<APIResponse<T>>,
  membershipId: string,
  membershipType: BungieMembershipType,
  ...args: any[]
): Promise<APIResponse<T>> => {
  return apiCall(membershipId, convertMembershipType(membershipType), ...args);
}; 