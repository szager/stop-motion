import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingsPage } from './settings.page';
import { ComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    ComponentsModule,
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
