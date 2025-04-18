import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityViewerComponent } from './activity-viewer/activity-viewer.component';

const routes: Routes = [
  { path: '', component: ActivityViewerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 