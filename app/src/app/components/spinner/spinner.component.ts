import { Component, Input } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { SpinnerOptions } from '@interfaces/spinner.interface';

@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss']
})

export class SpinnerComponent extends BaseComponent {
    @Input() spinnerOptions: SpinnerOptions;
}
