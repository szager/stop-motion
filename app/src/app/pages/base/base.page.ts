/*
 * Base class for all pages. Sets specific default values.
 * subscription is used bind a subscription of an http call to the page/component and destroy this subscription when the page is destroyed
 *
 */

import { Component } from '@angular/core';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseComponent } from '@components/base/base.component';
import { HeaderOptions } from '@interfaces/header-options.interface';
import { SpinnerOptions } from '@interfaces/spinner.interface';
import { BaseService } from '@services/base/base.service';
@Component({
    selector: 'app-base-page',
    template: ''
})
export abstract class BasePage extends BaseComponent {

    // declaration of fields
    public options: HeaderOptions;
    public spinnerOptions: SpinnerOptions;
    public submit: boolean;

    constructor(
        public baseService: BaseService
    ) {
        super(baseService);
        this.options = {
            title: null,
            backButton: false,
            backHref: '/',
            leftButton: false,
            leftHref: null,
            leftIcon: 'arrow-back',
            rightButton: true,
            rightHref: 'tabs/account',
            rightIcon: null
        };
        this.spinnerOptions = {
            type: 'list'
        };
        this.submit = false;
    }

    ionViewWillLeave(): void {
        // reset default values
        this.submit = false;
    }

    /*
     * Wrapper method to wrap data observable into another one and update header options
     */
    public wrapHeaderOptions<T>(source: Observable<T>, titleProperty: string): Observable<T> {
        return from(source).pipe(
            tap(data => {
                this.options.title = data[titleProperty];
            }));
    }
}
