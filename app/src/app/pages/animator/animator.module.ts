import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@components/components.module';
import { AnimatorPage } from './animator.page';

@NgModule({
  imports: [
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AnimatorPage,
      }
    ]),
  ],
  declarations: [AnimatorPage]
})
export class AnimatorPageModule {}
