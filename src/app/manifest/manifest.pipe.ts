import { Pipe, PipeTransform } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ManifestService } from './manifest.service'

type ManifestType = 'activityName' | 'activityMode' | 'activityIcon' | 'activityModeIcon'

@Pipe({
  name: 'manifest',
})
export class ManifestPipe implements PipeTransform {
  constructor(private manifestService: ManifestService) {}

  transform(hash: number, type: ManifestType): Observable<string> {
    return this.manifestService.state$.pipe(
      map((state) => {
        if (!state.loaded) {
          return ''
        }

        switch (type) {
          case 'activityName':
            return this.manifestService.defs.Activity?.get(hash)?.displayProperties.name || ''
          case 'activityMode':
            return this.manifestService.defs.ActivityMode?.get(hash)?.displayProperties.name || ''
          case 'activityIcon': {
            const activity = this.manifestService.defs.Activity?.get(hash)
            return activity?.displayProperties.hasIcon
              ? `https://bungie.net${activity.displayProperties.icon}`
              : ''
          }
          case 'activityModeIcon': {
            const mode = this.manifestService.defs.ActivityMode?.get(hash)
            return mode?.displayProperties.hasIcon
              ? `https://bungie.net${mode.displayProperties.icon}`
              : ''
          }
          default:
            return ''
        }
      })
    )
  }
}
