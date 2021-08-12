import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environment/environment';
import { Enviroment } from '@interfaces/environment.interface';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@services/alert/alert.service';
import { LayoutService } from '@services/layout/layout.service';
import { ToastService } from '@services/toast/toast.service';

@Injectable({
    providedIn: 'root'
})

/*
 * Base class for all other services. Sets some default values for all child services.
 * Also holds base configuration, depending on environment.
 */

export class BaseService {

    // declarations of fields
    private env: Enviroment;

    constructor(
        public alertService: AlertService,
        public layoutService: LayoutService,
        public loadingController: LoadingController,
        public router: Router,
        public toastService: ToastService,
        public translate: TranslateService,
    ) {
        // get current environement variables
        this.env = environment;
    }

    /*
     * Pass key and retrieve specfic environment property.
     */
    public getEnv(key: string): string {
        return this.env[key];
    }

    /*
    * A method to set data in the local storage
    */
    public getData(key: string): any {
        return JSON.parse(localStorage.getItem(key));
    }

    /*
     * A method to remove all data from the local storage
     */
    public removeAllData(): void {
        localStorage.clear();
    }

    /*
     * A method to remove data from the local storage
     */
    public removeData(key: string): void {
        localStorage.removeItem(key);
    }

    /*
     * A method to get data from local storage
     */
    public async setData(key: string, value: any): Promise<any> {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
