import { DestinyHistoricalStatsPeriodGroup } from 'bungie-api-ts/destiny2'

declare namespace destiny {
  interface Activity extends DestinyHistoricalStatsPeriodGroup {
    characterId?: string
    startDate?: Date
    endDate?: Date
    offset?: number
  }
}
