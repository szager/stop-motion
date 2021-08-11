/*
 * Base class for all components. Sets specific default values.
 */

import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Enviroment } from '@interfaces/environment.interface';
import { BaseService } from '@services/base/base.service';
import { environment } from '@environment/environment';

@Component({
    selector: 'app-base-component',
    template: ''
})
export abstract class BaseComponent implements OnDestroy {

    // declaration of fields
    public environment: Enviroment;
    public isLoading: boolean;
    public isSearching: boolean;
    public isPlaying: boolean;
    public item: Observable<any>;
    public lang: string;
    public list: Observable<any>;
    public loader: any;
    public state: Observable<any>;
    public submit: boolean;
    public readonly unsubscribe$: Subject<void> = new Subject();

    constructor(
        public baseService: BaseService
    ) {
        this.environment = environment;
        this.isLoading = false;
        this.isSearching = false;
        this.isPlaying = false;
        this.item = null;
        this.list = null;
        this.state = null;
        // set curr lang initially
        this.lang = this.baseService.translate.currentLang;
        // if language changes on run time update var
        this.baseService.translate.onLangChange.subscribe((langObj: any) => {
            this.lang = langObj.lang;
        });
    }

    /*
     * A method to display loading spinner
     */
    async presentLoading() {
        this.isLoading = true;
        this.loader = await this.baseService.loadingController.create({
            message: this.baseService.translate.instant('labels_loading')
        });
        await this.loader.present();
        return await this.loader;
    }

    /*
     * A method to dismiss loading spinner
     */
    dismissloading() {
        if (this.loader && this.loader !== undefined) {
            this.isLoading = false;
            this.loader.dismiss();
        }
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
