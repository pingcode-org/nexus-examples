import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@pc-nexus/angular/router';
import { ThyContent, ThyHeader, ThyLayout, ThySidebar, ThySidebarContent } from 'ngx-tethys/layout';
import { ThyMenuModule } from 'ngx-tethys/menu';
import { filter, map } from 'rxjs';
import { CAPABILITIES, CAPABILITY_GROUP, type CapabilityItem } from './app.routes';
import { ThyAlert } from 'ngx-tethys/alert';

@Component({
  selector: 'app-root',
  imports: [
    ThyLayout,
    ThySidebar,
    ThySidebarContent,
    ThyHeader,
    ThyAlert,
    ThyContent,
    ThyMenuModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);

  protected readonly group = CAPABILITY_GROUP;
  protected readonly items = CAPABILITIES;
  protected readonly page = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => this.pageFromUrl(event.urlAfterRedirects)),
    ),
    { initialValue: this.pageFromUrl(this.router.url) },
  );

  private pageFromUrl(url: string): CapabilityItem {
    const segments = url.split('?')[0].split('#')[0].replace(/^\//, '').split('/').filter(Boolean);
    const id = segments[0] === this.group ? segments[1] : segments[0];
    return this.items.find((item) => item.id === id) ?? this.items[0];
  }
}
