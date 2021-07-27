import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@components/components.module';
import { AnimatorPage } from './animator.page';
import { CaptureButtonComponent } from './components/capture-button/capture-button.component';
import { ClearButtonComponent } from './components/clear-button/clear-button.component';
import { LoadButtonComponent } from './components/load-button/load-button.component';
import { PlayButtonComponent } from './components/play-button/play-button.component';
import { RecordAudioButtonComponent } from './components/record-audio-button/record-audio-button.component';
import { SaveButtonComponent } from './components/save-button/save-button.component';
import { TabbarComponent } from './components/tabbar/tabbar.component';
import { ToggleButtonComponent } from './components/toggle-button/toggle-button.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UndoButtonComponent } from './components/undo-button/undo-button.component';

const COMPONENTS = [
  CaptureButtonComponent, 
  ClearButtonComponent,
  LoadButtonComponent,
  PlayButtonComponent,
  RecordAudioButtonComponent,
  SaveButtonComponent,
  TabbarComponent,
  ToggleButtonComponent,  
  ToolbarComponent,
  UndoButtonComponent 
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
