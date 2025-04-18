import { HttpClientModule } from '@angular/common/http'
import { LOCALE_ID, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatCardModule } from '@angular/material/card'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AppComponent } from './app.component'
import { BungieAuthModule } from './bungie-auth/bungie-auth.module'
import { BungieStatusComponent } from './bungie-status/bungie-status.component'
import { FooterComponent } from './footer/footer.component'
import { FrontPageComponent } from './front-page/front-page.component'
import { ManifestPipe } from './manifest/manifest.pipe'
import { NavComponent } from './nav/nav.component'
import { ActivitiesTotalHoursPipe } from './pipes/activities-total-hours.pipe'
import { ActivitiesTotalTimePipe } from './pipes/activities-total-time.pipe'
import { AddTimePipe } from './pipes/add-time.pipe'
import { CurrentStreakPipe } from './pipes/current-streak.pipe'
import { HoursPlayedPipe } from './pipes/hours-played.pipe'
import { LoadingReducePipe } from './pipes/loading-reduce.pipe'
import { LongestStreaksPipe } from './pipes/longest-streaks.pipe'
import { MilestonePipe } from './pipes/milestone.pipe'
import { ParseMinutesPlayedPipe } from './pipes/parse-minutes-played.pipe'
import { registerLocaleData } from '@angular/common'
import localeEn from '@angular/common/locales/en'
import localeFr from '@angular/common/locales/fr'
import localeEs from '@angular/common/locales/es'
import localePtBr from '@angular/common/locales/pt'
import localeZhCht from '@angular/common/locales/zh'
import localeZhChs from '@angular/common/locales/zh'
import localeDe from '@angular/common/locales/de'
import localeJa from '@angular/common/locales/ja'
import localeKo from '@angular/common/locales/ko'
import localeIt from '@angular/common/locales/it'
import localeRu from '@angular/common/locales/ru'
import localePl from '@angular/common/locales/pl'
import { ActivityViewerComponent } from './activity-viewer/activity-viewer.component'
import { BungieAuthService } from './bungie-auth/bungie-auth.service'
import { ManifestService } from './manifest/manifest.service'
import { BungieQueueService } from './services/queue.service'
import { AppRoutingModule } from './app-routing.module'

const lang = 'en-US'
registerLocaleData(localeEn)
navigator.languages.some((l) => {
  switch (l.toLowerCase()) {
    case 'pt-br':
      registerLocaleData(localePtBr)
      return true
    case 'zh-cht':
      registerLocaleData(localeZhCht)
      return true
    case 'zh-chs':
      registerLocaleData(localeZhChs)
      return true
    case 'fr':
      registerLocaleData(localeFr)
      return true
    case 'es':
      registerLocaleData(localeEs)
      return true
    case 'de':
      registerLocaleData(localeDe)
      return true
    case 'it':
      registerLocaleData(localeIt)
      return true
    case 'ja':
      registerLocaleData(localeJa)
      return true
    case 'ru':
      registerLocaleData(localeRu)
      return true
    case 'pl':
      registerLocaleData(localePl)
      return true
    case 'ko':
      registerLocaleData(localeKo)
      return true
  }
  switch (l.toLowerCase().split('-')[0]) {
    case 'fr':
      registerLocaleData(localeFr)
      return true
    case 'es':
      registerLocaleData(localeEs)
      return true
    case 'de':
      registerLocaleData(localeDe)
      return true
    case 'it':
      registerLocaleData(localeIt)
      return true
    case 'ja':
      registerLocaleData(localeJa)
      return true
    case 'ru':
      registerLocaleData(localeRu)
      return true
    case 'pl':
      registerLocaleData(localePl)
      return true
    case 'ko':
      registerLocaleData(localeKo)
      return true
  }
})

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FrontPageComponent,
    AddTimePipe,
    ManifestPipe,
    ActivitiesTotalTimePipe,
    ParseMinutesPlayedPipe,
    ActivitiesTotalHoursPipe,
    HoursPlayedPipe,
    FooterComponent,
    BungieStatusComponent,
    MilestonePipe,
    LoadingReducePipe,
    CurrentStreakPipe,
    LongestStreaksPipe,
    ActivityViewerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatCardModule,
    FormsModule,
    HttpClientModule,
    BungieAuthModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AppRoutingModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: lang },
    BungieAuthService,
    ManifestService,
    BungieQueueService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
