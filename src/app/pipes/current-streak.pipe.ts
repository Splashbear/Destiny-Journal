import { Pipe, PipeTransform } from '@angular/core'
import { Activity } from '../types/activity.types'

interface DayActivities {
  length: number
}

@Pipe({
  name: 'currentStreak',
  pure: false,
})
export class CurrentStreakPipe implements PipeTransform {
  transform(days: DayActivities[]): string {
    let type = 'inactive'
    let streak = 1
    if (days[days.length - 1].length > 0) {
      type = 'active'
    }
    for (let i = days.length - 2; i > -1; i--) {
      if ((type === 'active' && days[i].length > 0) || (type === 'inactive' && days[i].length < 1)) {
        streak++
      } else {
        break
      }
    }
    return `${streak} days ${type}`
  }
}
