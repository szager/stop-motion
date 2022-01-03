import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pipes

const PIPES = [];

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [...PIPES],
    exports: [...PIPES]
})
export class PipesModule { }
