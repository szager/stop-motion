import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingsPage } from './settings.page';
import { ComponentsModule } from '@components/components.module';
import { DirectivesModule } from 'src/app/directives/directives.module';

@NgModule({
  imports: [
    ComponentsModule,
    DirectivesModule,
    RouterModule.forChild([
      {
        path: '',
        component: SettingsPage
      }
    ]),
  ],
  declarations: [SettingsPage]
})
export class SettingsPageModule {}
