import { Pipe, PipeTransform } from '@angular/core'
import { scrubland } from '../scrubland.typings'

@Pipe({
  name: 'activitiesTotalTime',
  pure: false,
})
export class ActivitiesTotalTimePipe implements PipeTransform {
  transform(activities: scrubland.Activity[], args?: any): any {
    const time = activities.reduce(function (totalTime, activity) {
      return totalTime + +activity.values.timePlayedSeconds.basic.value
    }, 0)
    const d = Math.floor(time / 86400)
    const h = Math.floor((time % 86400) / 3600)
    const m = Math.floor(((time % 86400) % 3600) / 60)
    return d + 'd ' + h + 'h ' + m + 'm'
  }
}
