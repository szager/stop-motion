import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Directives

const DIRECTIVES = [];

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [...DIRECTIVES],
    exports: [...DIRECTIVES]
})
export class DirectivesModule { }
