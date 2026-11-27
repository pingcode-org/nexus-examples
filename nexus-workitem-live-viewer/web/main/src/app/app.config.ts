import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ThyAvatarService, ThyDefaultAvatarService } from 'ngx-tethys/avatar';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    { provide: ThyAvatarService, useClass: ThyDefaultAvatarService },
  ],
};
