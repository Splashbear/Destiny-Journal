export namespace destiny {
  export interface Activity {
    period: string;
    activityDetails: {
      mode: number;
      [key: string]: any;
    };
    values: {
      timePlayedSeconds: {
        basic: {
          value: number;
        };
      };
      [key: string]: any;
    };
    activityType?: string;
    duration?: string;
    [key: string]: any;
  }
} 