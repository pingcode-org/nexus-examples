import { provideHttpClient } from "@angular/common/http";
import {
  type ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { ThyDialogModule } from "ngx-tethys/dialog";
import { ThyIconRegistry } from "ngx-tethys/icon";
import { ThyTooltipModule } from "ngx-tethys/tooltip";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideHttpClient(),
    importProvidersFrom(ThyDialogModule, ThyTooltipModule),
    provideAppInitializer(() => {
      const iconRegistry = inject(ThyIconRegistry);
      const sanitizer = inject(DomSanitizer);
      const iconSetUrl = new URL("assets/icons/sprite.defs.svg", document.baseURI).toString();
      iconRegistry.addSvgIconSet(sanitizer.bypassSecurityTrustResourceUrl(iconSetUrl));
    }),
  ],
};
