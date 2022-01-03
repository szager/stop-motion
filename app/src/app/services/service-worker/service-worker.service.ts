import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { environment } from '@environment/environment';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';
import { BaseService } from '../base/base.service';
@Injectable({
    providedIn: 'root'
})
export class ServiceWorkerService {

    constructor(
        private appRef: ApplicationRef,
        private baseService: BaseService,
        private swUpdate: SwUpdate
    ) { }

    async initListener() {
        if (environment.production) {
            this.swUpdate.available.subscribe(async (evt: any) => {
                await  this.baseService.alertService.presentAlert({
                    header: this.baseService.translate.instant('alert_sw_update_title'),
                    message: this.baseService.translate.instant('alert_sw_update_message')
                });
                this.swUpdate.activateUpdate().then(() => window.location.reload());
            });
            // Allow the app to stabilize first, before starting polling for updates with `interval()`.
            const appIsStable = this.appRef.isStable.pipe(first(isStable => isStable === true));
            const everyHour = interval(60 * 60 * 1000);
            const everyHourOnceAppIsStable = concat(appIsStable, everyHour);

            everyHourOnceAppIsStable.subscribe(() => this.swUpdate.checkForUpdate());
        }
    }
}
