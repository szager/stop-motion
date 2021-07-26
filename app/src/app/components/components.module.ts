// modules
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { PipesModule } from '@pipes/pipes.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// components
import { HeaderComponent } from './header/header.component';
import { SpinnerComponent } from './spinner/spinner.component';

const COMPONENTS = [
    HeaderComponent,
    SpinnerComponent
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        RouterModule,
        TranslateModule,
        PipesModule
    ],
    declarations: [...COMPONENTS],
    exports: [...COMPONENTS, CommonModule, FormsModule, IonicModule, ReactiveFormsModule, TranslateModule]
})
export class ComponentsModule { }
