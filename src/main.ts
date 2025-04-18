import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BungieAuthModule } from './app/bungie-auth/bungie-auth.module';
import { BungieAuthService } from './app/bungie-auth/bungie-auth.service';
import { ManifestService } from './app/manifest/manifest.service';
import { BungieQueueService } from './app/services/queue.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    importProvidersFrom(
      HttpClientModule,
      BungieAuthModule
    ),
    BungieAuthService,
    ManifestService,
    BungieQueueService
  ]
}).catch(err => console.error(err));
