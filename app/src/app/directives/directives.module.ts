import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenUrlDirective } from './open-url/open-url.directive';

// Directives

const DIRECTIVES = [
    OpenUrlDirective
];

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [...DIRECTIVES],
    exports: [...DIRECTIVES]
})
export class DirectivesModule { }
