import { Routes } from '@angular/router';
import { FrontPageComponent } from './front-page/front-page.component';
import { ActivityViewerComponent } from './activity-viewer/activity-viewer.component';

export const routes: Routes = [
  { path: '', component: FrontPageComponent },
  { path: 'activities/:username', component: ActivityViewerComponent },
  { path: '**', redirectTo: '' }
]; 