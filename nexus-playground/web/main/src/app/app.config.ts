import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@pc-nexus/angular/router';
import { provideTethys } from 'ngx-tethys/core';
import { ThyIconRegistry } from 'ngx-tethys/icon';
import { routes } from './app.routes';
import { ThyAvatarService, ThyDefaultAvatarService } from 'ngx-tethys/avatar';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    { provide: ThyAvatarService, useClass: ThyDefaultAvatarService },
    provideAppInitializer(() => {
      const iconRegistry = inject(ThyIconRegistry);
      const domSanitizer = inject(DomSanitizer);
      iconRegistry.addSvgIconSet(
        domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/sprite.defs.svg'),
      );
    }),
    provideTethys(),
  ],
};
