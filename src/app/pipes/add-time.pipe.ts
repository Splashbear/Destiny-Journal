// Remove the unnecessary import
// import { destiny } from '../scrubland.typings'

import { Pipe, PipeTransform } from '@angular/core'
import { Activity } from '../types/activity.types'

@Pipe({
  name: 'addTime',
  pure: false,
})
export class AddTimePipe implements PipeTransform {
  transform(activities: Activity[], modeFilter?: number | string): number {
    return activities.reduce((count, activity) => {
      if (
        !modeFilter ||
        modeFilter === 0 ||
        modeFilter === '0' ||
        modeFilter === activity.activityDetails.mode ||
        activity.activityDetails.modes.indexOf(+modeFilter) > -1
      ) {
        return count + activity.values.timePlayedSeconds.basic.value;
      }
      return count;
    }, 0);
  }
}
