import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@components/components.module';
import { AnimatorPage } from './animator.page';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { TabbarComponent } from './components/tabbar/tabbar.component';

const COMPONENTS = [
  ToolbarComponent,
  TabbarComponent 
];

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
  providers: [],
  declarations: [...COMPONENTS, AnimatorPage],
  exports: [...COMPONENTS]
})
export class AnimatorPageModule {}
