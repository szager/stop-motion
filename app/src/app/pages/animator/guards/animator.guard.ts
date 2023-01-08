import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate } from '@angular/router';
import { BasePage } from '@pages/base/base.page';
import { AnimatorService } from '@services/animator/animator.service';
import { BaseService } from '@services/base/base.service';
import { first } from 'rxjs/operators';

/*
 * AnimatorGuard is to used to control exist intents on animator page
 */

@Injectable()

export class AnimatorGuard implements CanDeactivate<BasePage> {

    constructor(
        private animatorService: AnimatorService,
        private baseService: BaseService,
    ) { }

    public async canDeactivate(page: BasePage, currentRoute: ActivatedRouteSnapshot): Promise<boolean> {
        const frames = await this.animatorService.getFrames().pipe(first()).toPromise();
        if (frames.length) {
            let resolveFunction: (confirm: boolean) => void;
            this.baseService.alertService.presentAlert({
                header: this.baseService.translate.instant('alert_exit_animator_header'),
                message: this.baseService.translate.instant('alert_exit_animator_message'),
                buttons: [this.baseService.alertService.createButton(() => {
                    resolveFunction(false);
                }, 'buttons_no'),
                this.baseService.alertService.createButton(() => {
                    resolveFunction(true);
                    this.animatorService.clear();
                }, 'buttons_yes')]
            });
            return new Promise<boolean>(resolve => {
                resolveFunction = resolve;
            });
        } else {
            return true;
        }
    }
}
