// Remove the unnecessary import
// import { destiny } from '../scrubland.typings'

import { Pipe, PipeTransform } from '@angular/core'
import { Activity } from '../types/activity.types'

@Pipe({
  name: 'activitiesTotalHours',
  pure: false,
})
export class ActivitiesTotalHoursPipe implements PipeTransform {
  transform(activities: Activity[]): string {
    const time = activities.reduce((totalTime, activity) => {
      return totalTime + +activity.values.timePlayedSeconds.basic.value
    }, 0)
    const h = Math.floor(time / 3600)
    return `${h}h`
  }
}
