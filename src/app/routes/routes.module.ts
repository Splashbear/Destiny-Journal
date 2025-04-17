import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { FrontPageComponent } from '../front-page/front-page.component'
import { ActivityViewerComponent } from '../activity-viewer/activity-viewer.component'
import { AuthGuard } from '../bungie-auth/auth.guard'

const appRoutes: Routes = [
  { path: '', component: FrontPageComponent },
  { path: 'activities', component: ActivityViewerComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' },
]

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {})],
  exports: [RouterModule],
})
export class RoutesModule {}
