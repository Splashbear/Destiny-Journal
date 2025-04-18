// Remove the unnecessary import
// import { destiny } from '../scrubland.typings'

import { Pipe, PipeTransform } from '@angular/core'
import { Activity } from '../types/activity.types'

@Pipe({
  name: 'activitiesTotalTime',
  pure: false,
})
export class ActivitiesTotalTimePipe implements PipeTransform {
  transform(activities: Activity[], periods?: number): string {
    let time = activities.reduce((totalTime, activity) => {
      return totalTime + +activity.values.timePlayedSeconds.basic.value
    }, 0)
    if (periods) {
      time = time / periods
    }
    const d = Math.floor(time / 86400)
    const h = Math.floor((time % 86400) / 3600)
    const m = Math.floor(((time % 86400) % 3600) / 60)
    if (d > 0) {
      return `${d}d ${h}h ${m}m`
    } else if (h > 0) {
      return `${h}h ${m}m`
    } else {
      return `${m}m`
    }
  }
}
