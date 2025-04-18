import { Pipe, PipeTransform } from '@angular/core'

interface LoadingState {
  loading: boolean;
}

@Pipe({
  name: 'loadingReduce',
  pure: false,
})
export class LoadingReducePipe implements PipeTransform {
  transform(loading: LoadingState[]): boolean {
    return loading.some((load) => load.loading);
  }
}
