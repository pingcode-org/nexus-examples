import { Routes } from '@pc-nexus/angular/router';
import { EditLinkPage, NewLinkPage } from './link-form-page.component';
import { LinksPage } from './links-page.component';
import { RecentPage } from './recent-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'recent' },
  { path: 'recent', component: RecentPage },
  { path: 'links', component: LinksPage },
  { path: 'links/new', component: NewLinkPage },
  { path: 'links/:id', component: EditLinkPage },
  { path: '**', redirectTo: 'recent' },
];
